<?php
header('Content-Type: application/json');
require_once '../config/db.php';

$data = json_decode(file_get_contents('php://input'), true);

$project_name = $data['project_name'] ?? '';
$location = $data['location'] ?? '';
$start_date = $data['start_date'] ?? null;
$assigned_team = $data['assigned_team'] ?? '';
$status = $data['status'] ?? 'Pending';

if (!$project_name || !$location || !$start_date || !$assigned_team) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

// Generate a new ID (e.g., JO-008)
$stmt = $pdo->query("SELECT id FROM job_orders ORDER BY id DESC LIMIT 1");
$last = $stmt->fetch();
if ($last) {
    $num = intval(substr($last['id'], 3)) + 1;
    $newId = 'JO-' . str_pad($num, 3, '0', STR_PAD_LEFT);
} else {
    $newId = 'JO-001';
}

try {
    $stmt = $pdo->prepare("INSERT INTO job_orders (id, project_name, location, start_date, assigned_team, status) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$newId, $project_name, $location, $start_date, $assigned_team, $status]);
    echo json_encode(['success' => true, 'message' => 'Job order created', 'id' => $newId]);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>