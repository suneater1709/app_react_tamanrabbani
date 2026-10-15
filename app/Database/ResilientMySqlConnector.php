<?php

namespace App\Database;

use Illuminate\Database\Connectors\MySqlConnector;
use Illuminate\Support\Facades\Log;
use PDOException;

class ResilientMySqlConnector extends MySqlConnector
{
    /**
     * Establish a database connection with retry on connection saturation.
     *
     * @return \PDO
     */
    public function connect(array $config)
    {
        $attempts = 0;
        $maxAttempts = 3;
        $backoffMs = 150;

        while ($attempts < $maxAttempts) {
            $attempts++;
            try {
                return parent::connect($config);
            } catch (PDOException $e) {
                $isTooMany = ($e->getCode() == 1040)
                    || (isset($e->errorInfo[1]) && (int) $e->errorInfo[1] === 1040)
                    || str_contains($e->getMessage(), 'Too many connections')
                    || str_contains($e->getMessage(), '1040');

                if ($isTooMany && $attempts < $maxAttempts) {
                    try {
                        Log::warning("ResilientMySqlConnector: Too many connections (attempt {$attempts}/{$maxAttempts}). Retrying in {$backoffMs}ms...");
                    } catch (\Throwable) {
                        // Ignore logging issues during early boot
                    }
                    usleep($backoffMs * 1000 * $attempts);

                    continue;
                }

                throw $e;
            }
        }

        return parent::connect($config);
    }
}
