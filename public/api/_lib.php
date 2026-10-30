<?php
declare(strict_types=1);

const DATA_DIR = __DIR__ . '/../data';
const UPLOAD_DIR = __DIR__ . '/../uploads';

if (is_file(__DIR__ . '/config.php')) {
    require_once __DIR__ . '/config.php';
}

header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function respond(array $body, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function admin_configured(): bool
{
    return defined('ADMIN_PASSWORD') && is_string(ADMIN_PASSWORD) && strlen(ADMIN_PASSWORD) >= 6
        && ADMIN_PASSWORD !== 'ضع-كلمة-مرور-قوية-هنا';
}

function require_admin(): void
{
    $given = $_SERVER['HTTP_X_ADMIN_KEY'] ?? ($_POST['admin_key'] ?? '');
    if (!is_string($given) || !admin_configured() || !hash_equals(ADMIN_PASSWORD, $given)) {
        usleep(700000); // slow down password guessing
        respond(['ok' => false, 'code' => 'unauthorized'], 401);
    }
}

function ensure_dir(string $dir, string $htaccess): void
{
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    $file = $dir . '/.htaccess';
    if (is_dir($dir) && !is_file($file)) {
        @file_put_contents($file, $htaccess);
    }
}

function ensure_dirs(): void
{
    ensure_dir(DATA_DIR, "Require all denied\n<IfModule !mod_authz_core.c>\nOrder allow,deny\nDeny from all\n</IfModule>\n");
    ensure_dir(UPLOAD_DIR, "php_flag engine off\nRemoveHandler .php .phtml .php3 .php5\nOptions -ExecCGI -Indexes\n");
}

function read_json(string $name, array $default): array
{
    $path = DATA_DIR . '/' . $name;
    if (!is_file($path)) {
        return $default;
    }
    $raw = @file_get_contents($path);
    $data = $raw === false ? null : json_decode($raw, true);
    return is_array($data) ? $data : $default;
}

function write_json(string $name, array $data): void
{
    ensure_dirs();
    $path = DATA_DIR . '/' . $name;
    $tmp = $path . '.' . bin2hex(random_bytes(4)) . '.tmp';
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if (@file_put_contents($tmp, $json, LOCK_EX) === false || !@rename($tmp, $path)) {
        @unlink($tmp);
        respond(['ok' => false, 'code' => 'storage_unavailable'], 500);
    }
}

function default_products(): array
{
    $rows = [
        [1, 'إطار ذهبي دائري', 'medical', 38, 'سلك معدني رفيع بتصميم كلاسيكي خفيف', 'gold-round'],
        [2, 'كات آي بنقشة السلحفاة', 'medical', 42, 'أسيتات فاخر بنقشة دافئة وإطلالة أنيقة', 'tortoise-cateye'],
        [3, 'مستطيل أسود مطفي', 'medical', 35, 'خطوط حادة وثبات يومي للعمل والدراسة', 'matte-black'],
        [4, 'أفياتور فضي بمرايا زرقاء', 'sun', 29, 'عدسات متدرجة تحمي من وهج الشمس', 'aviator-blue'],
        [5, 'كريستال رمادي شفاف', 'medical', 45, 'أسيتات شفاف بلمسة دخانية عصرية', 'crystal-smoke'],
        [6, 'مربع روز جولد', 'sun', 33, 'إطار كبير بعدسات بنية متدرجة', 'rose-square'],
    ];
    return array_map(static fn(array $r): array => [
        'id' => $r[0], 'name' => $r[1], 'category' => $r[2], 'price' => $r[3],
        'description' => $r[4], 'image' => '/assets/products/' . $r[5] . '.webp',
    ], $rows);
}

function load_products(): array
{
    return read_json('products.json', default_products());
}

function load_settings(): array
{
    $defaults = ['whatsapp' => '', 'instagram' => '', 'address' => '', 'hours' => ''];
    return array_merge($defaults, array_intersect_key(read_json('settings.json', []), $defaults));
}
