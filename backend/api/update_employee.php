<?php
header('Content-Type: application/json');
require_once '../config/db.php';

$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'] ?? null;
$name = $data['name'] ?? '';
$position = $data['position'] ?? '';
$department = $data['department'] ?? '';
$dailyRate = $data['daily_rate'] ?? 0;
$status = $data['status'] ?? '';

if (!$id) {
    echo json_encode(['success' => false, 'message' => 'Employee ID required']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE employees SET name = ?, position = ?, department = ?, daily_rate = ?, status = ? WHERE id = ?");
    $stmt->execute([$name, $position, $department, $dailyRate, $status, $id]);
    echo json_encode(['success' => true, 'message' => 'Employee updated successfully']);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>