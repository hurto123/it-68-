<?php
header('Content-Type: application/json; charset=utf-8');
$input = file_get_contents('php://input');
if (!$input) { echo json_encode(['ok'=>false,'message'=>'ไม่มีข้อมูล']); exit; }
$newp = json_decode($input, true);
if (!$newp) { echo json_encode(['ok'=>false,'message'=>'JSON ไม่ถูกต้อง']); exit; }
$path = __DIR__ . '/../data/problems.json';
if (!file_exists($path)) { file_put_contents($path, '[]'); }
$arr = json_decode(file_get_contents($path), true);
$arr[] = $newp;
file_put_contents($path, json_encode($arr, JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT));
echo json_encode(['ok'=>true,'message'=>'เพิ่มโจทย์เรียบร้อย']);
