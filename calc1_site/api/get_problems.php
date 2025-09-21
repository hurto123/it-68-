<?php
header('Content-Type: application/json; charset=utf-8');
$path = __DIR__ . '/../data/problems.json';
if (!file_exists($path)) { echo json_encode([]); exit; }
echo file_get_contents($path);
