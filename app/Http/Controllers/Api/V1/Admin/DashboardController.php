<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Pendaftar;
use App\Models\Tenant\Program;
use App\Models\Admin\ActivityLog;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Get statistics summaries and activity logs for the Admin Dashboard.
     */
    public function stats(): JsonResponse
    {
        // 1. Core applicant statuses
        $total = Pendaftar::count();
        $accepted = Pendaftar::where('status', 'accepted')->count();
        $revision = Pendaftar::where('status', 'revision')->count();
        $pending = Pendaftar::where('status', 'pending')->count();

        // 2. Program statistics
        $programs = Program::withCount(['pendaftar'])->get()->map(function ($p) {
            return [
                'id' => $p->id,
                'name' => $p->name,
                'code' => $p->code,
                'count' => $p->pendaftar_count,
            ];
        });

        // 3. Latest registrations (limit 5)
        $latestRegistrations = Pendaftar::with('program')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($reg) {
                return [
                    'id' => $reg->id,
                    'registration_number' => $reg->registration_number,
                    'full_name' => $reg->full_name,
                    'program' => $reg->program->code,
                    'status' => $reg->status,
                    'created_at' => $reg->created_at->toISOString(),
                ];
            });

        // 4. Recent activities logs (limit 6)
        $recentActivities = ActivityLog::with('user')
            ->orderBy('created_at', 'desc')
            ->take(6)
            ->get()
            ->map(function ($act) {
                return [
                    'id' => $act->id,
                    'user_name' => $act->user ? $act->user->name : 'System',
                    'action' => $act->action,
                    'description' => $act->description,
                    'created_at' => $act->created_at->toISOString(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => [
                    'total' => $total,
                    'accepted' => $accepted,
                    'revision' => $revision,
                    'pending' => $pending
                ],
                'programs' => $programs,
                'latest_registrations' => $latestRegistrations,
                'recent_activities' => $recentActivities
            ]
        ]);
    }
}
