<?php
declare(strict_types=1);
require_once __DIR__ . '/_lib.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    respond([
        'products' => array_values(load_products()),
        'settings' => load_settings(),
        'adminReady' => admin_configured(),
    ]);
}

if ($method !== 'POST') {
    respond(['ok' => false, 'code' => 'method_not_allowed'], 405);
}

require_admin();
$op = (string)($_POST['op'] ?? '');

if ($op === 'ping') {
    respond(['ok' => true]);
}

if ($op === 'add') {
    $name = trim((string)($_POST['name'] ?? ''));
    $description = trim((string)($_POST['description'] ?? ''));
    $category = ($_POST['category'] ?? '') === 'sun' ? 'sun' : 'medical';
    $price = filter_var($_POST['price'] ?? null, FILTER_VALIDATE_FLOAT);
    $file = $_FILES['file'] ?? null;

    if ($name === '' || mb_strlen($name) > 80 || $price === false || $price < 0 || $price > 100000) {
        respond(['ok' => false, 'code' => 'invalid_fields'], 400);
    }
    if (!$file || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK || $file['size'] > 5_000_000) {
        respond(['ok' => false, 'code' => 'invalid_image'], 400);
    }

    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    $extensions = ['image/webp' => 'webp', 'image/jpeg' => 'jpg', 'image/png' => 'png'];
    if (!isset($extensions[$mime])) {
        respond(['ok' => false, 'code' => 'invalid_image'], 400);
    }

    ensure_dirs();
    $filename = bin2hex(random_bytes(12)) . '.' . $extensions[$mime];
    if (!move_uploaded_file($file['tmp_name'], UPLOAD_DIR . '/' . $filename)) {
        respond(['ok' => false, 'code' => 'storage_unavailable'], 500);
    }

    $products = array_values(load_products());
    $nextId = 1 + max(array_map(static fn(array $p): int => (int)$p['id'], $products) ?: [0]);
    array_unshift($products, [
        'id' => $nextId,
        'name' => mb_substr($name, 0, 80),
        'category' => $category,
        'price' => (float)$price,
        'description' => mb_substr($description, 0, 160),
        'image' => '/uploads/' . $filename,
    ]);
    write_json('products.json', $products);
    respond(['ok' => true, 'id' => $nextId]);
}

if ($op === 'delete') {
    $id = filter_var($_POST['id'] ?? null, FILTER_VALIDATE_INT);
    if ($id === false) {
        respond(['ok' => false, 'code' => 'invalid_id'], 400);
    }
    $kept = [];
    foreach (load_products() as $p) {
        if ((int)$p['id'] === $id) {
            if (str_starts_with((string)$p['image'], '/uploads/')) {
                @unlink(UPLOAD_DIR . '/' . basename((string)$p['image']));
            }
            continue;
        }
        $kept[] = $p;
    }
    write_json('products.json', $kept);
    respond(['ok' => true]);
}

respond(['ok' => false, 'code' => 'unknown_op'], 400);
