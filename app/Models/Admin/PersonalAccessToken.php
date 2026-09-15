<?php

namespace App\Models\Admin;

use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

class PersonalAccessToken extends SanctumPersonalAccessToken
{
    protected $connection = 'mysql_admin';

    protected $table = 'personal_access_tokens';
}
