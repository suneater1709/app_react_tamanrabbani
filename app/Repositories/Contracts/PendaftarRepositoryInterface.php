<?php

namespace App\Repositories\Contracts;

interface PendaftarRepositoryInterface
{
    public function all();

    public function find($id);

    public function findOrFail($id);

    public function create(array $attributes);

    public function update($id, array $attributes);

    public function delete($id);

    public function findByRegistrationNumber(string $regNum);

    public function findByUuid(string $uuid);

    public function getFilteredList(array $filters);
}
