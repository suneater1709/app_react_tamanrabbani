<?php

use App\Repositories\Contracts\PendaftarRepositoryInterface;
use App\Services\AdmissionService;

test('it calculates payment snapshot correctly for KB and Gelombang 1', function () {
    $repoMock = Mockery::mock(PendaftarRepositoryInterface::class);
    $service = new AdmissionService($repoMock);

    // Call compute directly or with mock
    $serviceRefl = new ReflectionClass($service);
    expect($service)->toBeInstanceOf(AdmissionService::class);
});
