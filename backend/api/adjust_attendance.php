<?php
header('Content-Type: application/json');
require_once '../config/db.php';
session_start();

$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'] ?? null;
$newTimestamp = $data['new_timestamp'] ?? null;
$reason = $data['reason'] ?? null;

if (!$id || !$newTimestamp || !$reason) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

try {
    // Get original record
    $stmt = $pdo->prepare("SELECT * FROM attendance WHERE id = ?");
    $stmt->execute([$id]);
    $original = $stmt->fetch();
    
    if (!$original) {
        echo json_encode(['success' => false, 'message' => 'Attendance record not found']);
        exit;
    }
    
    // Update with adjusted timestamp
    $stmt = $pdo->prepare("UPDATE attendance SET timestamp = ?, is_adjusted = 1, original_timestamp = ?, adjusted_by = ?, reason = ? WHERE id = ?");
    $stmt->execute([$newTimestamp, $original['timestamp'], $_SESSION['user_id'], $reason, $id]);
    
    echo json_encode(['success' => true, 'message' => 'Attendance adjusted successfully']);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>