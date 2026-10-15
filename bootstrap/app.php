<?php

use Illuminate\Database\QueryException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use PDOException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            AddLinkHeadersForPreloadedAssets::class,
        ]);
        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        // Catch database connection / saturation errors (e.g. 1040 Too Many Connections)
        $exceptions->render(function (PDOException $e, Request $request) {
            try {
                Log::error('PDOException caught: '.$e->getMessage(), [
                    'code' => $e->getCode(),
                    'url' => $request->fullUrl(),
                ]);
            } catch (Throwable) {
                // Ignore logging failures if logging database/disk is constrained
            }

            $isTooMany = ($e->getCode() == 1040)
                || (isset($e->errorInfo[1]) && (int) $e->errorInfo[1] === 1040)
                || str_contains($e->getMessage(), 'Too many connections')
                || str_contains($e->getMessage(), '1040');

            $message = $isTooMany
                ? 'Maaf, antrean koneksi server sedang sangat padat. Mohon tunggu 1-2 menit lalu coba kirim kembali.'
                : 'Maaf, terjadi kendala saat menghubungkan ke server pendaftaran. Silakan coba beberapa saat lagi.';

            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $message,
                ], $isTooMany ? 503 : 500);
            }
        });

        // Catch QueryException (e.g. database query errors during validation or transactions)
        $exceptions->render(function (QueryException $e, Request $request) {
            try {
                Log::error('QueryException caught: '.$e->getMessage(), [
                    'sql' => $e->getSql(),
                    'url' => $request->fullUrl(),
                ]);
            } catch (Throwable) {
                // Ignore logging failures
            }

            $isTooMany = str_contains($e->getMessage(), 'Too many connections') || str_contains($e->getMessage(), '1040');

            $message = $isTooMany
                ? 'Maaf, antrean koneksi server sedang sangat padat. Mohon tunggu 1-2 menit lalu coba kirim kembali.'
                : 'Maaf, terjadi kendala pemrosesan data di server. Silakan coba beberapa saat lagi.';

            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $message,
                ], $isTooMany ? 503 : 500);
            }
        });

        // Catch general unhandled exceptions on API requests to ensure no sensitive raw traces leak
        $exceptions->render(function (Throwable $e, Request $request) {
            if ($e instanceof ValidationException) {
                return null; // Let Laravel format validation errors normally
            }

            if ($e instanceof HttpExceptionInterface) {
                return null; // Let standard HTTP exceptions (404, 403, 401, 419) pass through
            }

            try {
                Log::error('Unhandled exception on API request: '.$e->getMessage(), [
                    'exception' => get_class($e),
                    'url' => $request->fullUrl(),
                ]);
            } catch (Throwable) {
                // Ignore logging failures
            }

            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Maaf, terjadi kendala teknis pada sistem pendaftaran. Silakan coba beberapa saat lagi.',
                ], 500);
            }
        });
    })->create();
