<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin\User;
use App\Models\Admin\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AdminUserController extends Controller
{
    /**
     * Display a listing of admin users.
     */
    public function index(Request $request): JsonResponse
    {
        // Load users with roles on mysql_admin connection
        $users = User::with('roles')->get();

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Store a newly created admin user in storage.
     */
    public function store(Request $request): JsonResponse
    {
        // Check if the current user is Super Admin
        if (!$request->user()->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya Super Admin yang dapat menambahkan admin baru.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|max:255|unique:mysql_admin.users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|string|in:super_admin,admin,verifier',
        ], [
            'name.required' => 'Nama wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.unique' => 'Email sudah terdaftar.',
            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Password minimal berisi 6 karakter.',
            'role.required' => 'Role wajib dipilih.',
            'role.in' => 'Role tidak valid.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        return DB::connection('mysql_admin')->transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            // Sync role (ensure the role exists first)
            $role = Role::firstOrCreate(
                ['name' => $request->role],
                ['guard_name' => 'web']
            );
            $user->roles()->sync([$role->id]);

            return response()->json([
                'success' => true,
                'message' => 'Admin baru berhasil ditambahkan.',
                'data' => $user->load('roles')
            ]);
        });
    }

    /**
     * Update the specified admin user in storage.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        // Check if the current user is Super Admin
        if (!$request->user()->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya Super Admin yang dapat mengubah data admin.'
            ], 403);
        }

        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|max:255|unique:mysql_admin.users,email,' . $id,
            'password' => 'nullable|string|min:6',
            'role' => 'required|string|in:super_admin,admin,verifier',
        ], [
            'name.required' => 'Nama wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.unique' => 'Email sudah terdaftar.',
            'password.min' => 'Password minimal berisi 6 karakter.',
            'role.required' => 'Role wajib dipilih.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        return DB::connection('mysql_admin')->transaction(function () use ($request, $user) {
            $updateData = [
                'name' => $request->name,
                'email' => $request->email,
            ];

            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($request->password);
            }

            $user->update($updateData);

            // Sync role
            $role = Role::firstOrCreate(
                ['name' => $request->role],
                ['guard_name' => 'web']
            );
            $user->roles()->sync([$role->id]);

            return response()->json([
                'success' => true,
                'message' => 'Data admin berhasil diperbarui.',
                'data' => $user->load('roles')
            ]);
        });
    }

    /**
     * Remove the specified admin user from storage.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        // Check if the current user is Super Admin
        if (!$request->user()->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya Super Admin yang dapat menghapus admin.'
            ], 403);
        }

        // Prevent self-deletion
        if ($request->user()->id === $id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri.'
            ], 400);
        }

        $user = User::findOrFail($id);
        $user->roles()->detach();
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Akun admin berhasil dihapus.'
        ]);
    }
}
