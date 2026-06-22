<?php
header('Content-Type: application/json');
require_once '../config/db.php';

$stmt = $pdo->query("SELECT id, name, position, department, daily_rate, status, current_team FROM employees");
$employees = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode(['success' => true, 'data' => $employees]);
?>