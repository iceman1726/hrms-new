<?php
header('Content-Type: application/json');
require_once '../config/db.php';

$data = json_decode(file_get_contents('php://input'), true);

$id = $data['id'] ?? '';
$project_name = $data['project_name'] ?? '';
$location = $data['location'] ?? '';
$start_date = $data['start_date'] ?? null;
$assigned_team = $data['assigned_team'] ?? '';
$status = $data['status'] ?? '';

if (!$id || !$project_name || !$location || !$start_date || !$assigned_team || !$status) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE job_orders SET project_name = ?, location = ?, start_date = ?, assigned_team = ?, status = ? WHERE id = ?");
    $stmt->execute([$project_name, $location, $start_date, $assigned_team, $status, $id]);
    echo json_encode(['success' => true, 'message' => 'Job order updated successfully']);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>