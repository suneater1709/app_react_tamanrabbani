<?php

test('spa root returns a successful response', function () {
    $response = $this->get('/');

    $response->assertOk();
});
