<?php
header('Content-Type: application/json');
require_once '../config/db.php';

try {
    $stmt = $pdo->prepare("UPDATE employees SET current_team = NULL");
    $stmt->execute();
    echo json_encode(['success' => true, 'message' => 'All assignments have been reset.']);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>