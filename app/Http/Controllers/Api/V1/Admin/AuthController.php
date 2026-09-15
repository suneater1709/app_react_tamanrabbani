<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin\LoginLog;
use App\Models\Admin\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Authenticate administrative user and issue Sanctum token.
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string',
            'password' => 'required|string',
        ], [
            'email.required' => 'Email atau username wajib diisi.',
            'password.required' => 'Kata sandi wajib diisi.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        // Query user on mysql_admin database connection
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email/username atau password Anda salah.',
            ], 401);
        }

        // Generate Sanctum token
        $token = $user->createToken('admin_auth_token')->plainTextToken;

        // Record Login Log
        $loginLog = LoginLog::create([
            'user_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'login_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->roles->pluck('name'),
                ],
                'login_log_id' => $loginLog->id,
            ],
        ]);
    }

    /**
     * Revoke administrative user token and log logout time.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user) {
            // Revoke current token
            $user->currentAccessToken()->delete();

            // Try to find the latest login log and update the logout time
            $latestLog = LoginLog::where('user_id', $user->id)
                ->whereNull('logout_at')
                ->orderBy('login_at', 'desc')
                ->first();

            if ($latestLog) {
                $latestLog->logout_at = now();
                $latestLog->save();
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
        ]);
    }

    /**
     * Return authenticated admin user profile.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
                'permissions' => $user->roles->flatMap(function ($role) {
                    return $role->permissions->pluck('name');
                })->unique()->values(),
            ],
        ]);
    }
}
