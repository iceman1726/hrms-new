<?php
header('Content-Type: application/json');
require_once '../config/db.php';

$data = json_decode(file_get_contents('php://input'), true);
$name = $data['name'] ?? '';
$position = $data['position'] ?? '';
$department = $data['department'] ?? '';
$dailyRate = $data['daily_rate'] ?? 0;
$status = $data['status'] ?? 'Active';

if (!$name || !$position || !$department) {
    echo json_encode(['success' => false, 'message' => 'Name, position, and department are required']);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO employees (name, position, department, daily_rate, status) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$name, $position, $department, $dailyRate, $status]);
    echo json_encode(['success' => true, 'message' => 'Employee added successfully', 'id' => $pdo->lastInsertId()]);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>