<?php

namespace App\Http\Controllers\Api\V1\Admin\CMS;

use App\Http\Controllers\Controller;
use App\Models\Admin\ActivityLog;
use App\Models\Tenant\SchoolProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    /**
     * Get all school profile items.
     */
    public function index(): JsonResponse
    {
        $keys = ['history', 'vision', 'mission', 'welcome_message'];
        $profiles = [];

        foreach ($keys as $key) {
            $record = SchoolProfile::where('key', $key)->first();
            $profiles[$key] = $record ? $record->value : '';
        }

        return response()->json([
            'success' => true,
            'data' => $profiles,
        ]);
    }

    /**
     * Update school profile key values.
     */
    public function update(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'history' => 'required|string',
            'vision' => 'required|string',
            'mission' => 'required|string',
            'welcome_message' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $adminUser = $request->user();
        $keys = ['history', 'vision', 'mission', 'welcome_message'];

        foreach ($keys as $key) {
            SchoolProfile::updateOrCreate(
                ['key' => $key],
                ['value' => $request->input($key)]
            );
        }

        // Log admin operation
        ActivityLog::create([
            'user_id' => $adminUser->id,
            'action' => 'update_profile_cms',
            'description' => 'Updated school profile details (history, vision, mission, and welcome message).',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profil sekolah berhasil diperbarui.',
        ]);
    }
}
