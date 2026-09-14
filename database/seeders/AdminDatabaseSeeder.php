<?php

namespace Database\Seeders;

use App\Models\Admin\AdminSetting;
use App\Models\Admin\Permission;
use App\Models\Admin\Role;
use App\Models\Admin\User;
use App\Models\Admin\ActivityLog;
use App\Models\Admin\LoginLog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Carbon;

class AdminDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Permissions
        $permissions = [
            'manage-admins' => 'Manage administrators and user roles',
            'manage-cms' => 'Manage website profiles, news, galleries, and pages',
            'verify-applicants' => 'View applicants dossiers and verify their statuses',
            'export-data' => 'Export applicant list to Excel and sync with Google Sheets',
            'edit-settings' => 'Edit school settings and PPDB schedules',
        ];

        $permissionModels = [];
        foreach ($permissions as $name => $desc) {
            $permissionModels[$name] = Permission::updateOrCreate(
                ['name' => $name],
                ['guard_name' => 'web']
            );
        }

        // 2. Create Roles
        $superAdminRole = Role::updateOrCreate(['name' => 'super_admin'], ['guard_name' => 'web']);
        $verifierRole = Role::updateOrCreate(['name' => 'verifier'], ['guard_name' => 'web']);

        // Assign Permissions to Roles
        // Super Admin gets all
        $superAdminRole->permissions()->sync(collect($permissionModels)->pluck('id')->toArray());
        
        // Verifier gets specific permissions
        $verifierPermissions = [
            $permissionModels['verify-applicants']->id,
            $permissionModels['export-data']->id,
        ];
        $verifierRole->permissions()->sync($verifierPermissions);

        // 3. Create Users
        $superAdminUser = User::updateOrCreate(
            ['email' => 'admin'],
            [
                'name' => 'Admin Taman Robbani',
                'password' => Hash::make('admin123'),
                'email_verified_at' => now(),
            ]
        );
        $superAdminUser->roles()->sync([$superAdminRole->id]);

        $rumiAdminUser = User::updateOrCreate(
            ['email' => 'rumi'],
            [
                'name' => 'Rumi Admin',
                'password' => Hash::make('rumi1975'),
                'email_verified_at' => now(),
            ]
        );
        $rumiAdminUser->roles()->sync([$superAdminRole->id]);

        // 4. Create Admin Settings
        $settings = [
            'app_name' => 'PPDB Admin KB-TK IT Taman Robbani',
            'max_login_attempts' => '5',
            'session_timeout' => '120',
            'maintenance_mode' => 'false',
        ];

        foreach ($settings as $key => $val) {
            AdminSetting::updateOrCreate(['key' => $key], ['value' => $val]);
        }

        // 5. Create some logs
        ActivityLog::create([
            'user_id' => $superAdminUser->id,
            'action' => 'seed_database',
            'description' => 'Initialized administrative role, user, and permission tables.',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Seeder Agent',
        ]);

        LoginLog::create([
            'user_id' => $superAdminUser->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Seeder Agent',
            'login_at' => now()->subMinutes(10),
            'logout_at' => now(),
        ]);
    }
}
