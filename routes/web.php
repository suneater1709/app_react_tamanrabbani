<?php

use Illuminate\Support\Facades\Route;

// Fallback direct storage file server for public assets
Route::get('storage/{path}', function (string $path) {
    $filePath = storage_path('app/public/'.$path);
    if (! file_exists($filePath) || is_dir($filePath)) {
        abort(404);
    }

    return response()->file($filePath);
})->where('path', '.*');

Route::any('{any}', function () {
    return view('app');
})->where('any', '^(?!api).*$');
