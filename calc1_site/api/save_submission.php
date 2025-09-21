<?php
header('Content-Type: application/json; charset=utf-8');
$input = file_get_contents('php://input');
if (!$input) { echo json_encode(['ok'=>false,'message'=>'ไม่มีข้อมูล']); exit; }
$payload = json_decode($input, true);
if (!$payload) { echo json_encode(['ok'=>false,'message'=>'รูปแบบ JSON ไม่ถูกต้อง']); exit; }
$dir = __DIR__ . '/../data';
if (!is_dir($dir)) { mkdir($dir, 0777, true); }
$file = $dir . '/submissions.csv';
$line = date('c') . "," . str_replace(["
","",","], " ", json_encode($payload, JSON_UNESCAPED_UNICODE)) . "\n";
file_put_contents($file, $line, FILE_APPEND | LOCK_EX);
echo json_encode(['ok'=>true,'message'=>'บันทึกผลแล้ว']);
