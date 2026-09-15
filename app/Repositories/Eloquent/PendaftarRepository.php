<?php

namespace App\Repositories\Eloquent;

use App\Models\Tenant\Pendaftar;
use App\Repositories\Contracts\PendaftarRepositoryInterface;

class PendaftarRepository extends BaseRepository implements PendaftarRepositoryInterface
{
    public function __construct(Pendaftar $model)
    {
        parent::__construct($model);
    }

    public function findByRegistrationNumber(string $regNum)
    {
        return $this->model->where('registration_number', $regNum)
            ->with(['program', 'parents', 'documents', 'statusLogs'])
            ->first();
    }

    public function findByUuid(string $uuid)
    {
        return $this->model->where('uuid', $uuid)
            ->with(['program', 'parents', 'documents', 'statusLogs'])
            ->first();
    }

    public function getFilteredList(array $filters)
    {
        $query = $this->model->newQuery()->with(['program', 'parents']);

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('registration_number', 'like', "%{$search}%")
                    ->orWhere('nik', 'like', "%{$search}%")
                    ->orWhereHas('parents', function ($pq) use ($search) {
                        $pq->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if (! empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['program_id'])) {
            $query->where('program_id', $filters['program_id']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($filters['per_page'] ?? 15);
    }
}
