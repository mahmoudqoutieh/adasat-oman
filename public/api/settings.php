<?php
declare(strict_types=1);
require_once __DIR__ . '/_lib.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(['ok' => false, 'code' => 'method_not_allowed'], 405);
}

$body = json_decode((string)file_get_contents('php://input'), true);
$_POST['admin_key'] = is_array($body) ? ($body['admin_key'] ?? '') : '';
require_admin();

$clean = [
    'whatsapp' => substr(preg_replace('/\D/', '', (string)($body['whatsapp'] ?? '')) ?? '', 0, 16),
    'instagram' => mb_substr(ltrim(trim((string)($body['instagram'] ?? '')), '@'), 0, 40),
    'address' => mb_substr(trim((string)($body['address'] ?? '')), 0, 140),
    'hours' => mb_substr(trim((string)($body['hours'] ?? '')), 0, 140),
];
write_json('settings.json', $clean);
respond(['ok' => true]);
