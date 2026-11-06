<?php
// Lead handler for Timeweb shared hosting (data stays in RU).
// Secrets live one level above the web root in lead-config.php:
//   <?php return ['tg_token' => '...', 'tg_chat' => '...', 'mail_to' => 'owner@example.ru'];
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit('{"ok":false}'); }

$cfg = @include __DIR__ . '/../lead-config.php';
$in = json_decode(file_get_contents('php://input'), true) ?: [];
$clean = fn($v, $n = 300) => mb_substr(trim(strip_tags((string)($v ?? ''))), 0, $n);
$name = $clean($in['name'] ?? '', 80);
$phone = $clean($in['phone'] ?? '', 40);
if ($name === '' || !preg_match('/\d{10,}/', preg_replace('/\D/', '', $phone))) { http_response_code(422); exit('{"ok":false}'); }

$text = "Заявка с сайта DM Group\n"
  . "Имя: $name\nТелефон: $phone\n"
  . "Что нужно: " . $clean($in['kind'] ?? '') . "\n"
  . "Комментарий: " . $clean($in['comment'] ?? '', 1000) . "\n"
  . "Страница: " . $clean($in['page'] ?? '') . "\n" . date('d.m.Y H:i');

// keep a local copy so no lead is lost if a channel is down
@file_put_contents(__DIR__ . '/../leads.log', $text . "\n---\n", FILE_APPEND | LOCK_EX);

$sent = false;
if (!empty($cfg['tg_token']) && !empty($cfg['tg_chat'])) {
  $ch = curl_init('https://api.telegram.org/bot' . $cfg['tg_token'] . '/sendMessage');
  curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8,
    CURLOPT_POSTFIELDS => ['chat_id' => $cfg['tg_chat'], 'text' => $text]]);
  $sent = curl_exec($ch) !== false && curl_getinfo($ch, CURLINFO_HTTP_CODE) === 200;
  curl_close($ch);
}
if (!empty($cfg['mail_to'])) {
  $sent = mail($cfg['mail_to'], '=?UTF-8?B?' . base64_encode('Заявка с сайта DM Group') . '?=', $text,
    "Content-Type: text/plain; charset=utf-8\r\n") || $sent;
}
echo json_encode(['ok' => true, 'delivered' => $sent]);
