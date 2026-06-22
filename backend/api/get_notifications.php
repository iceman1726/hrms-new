<?php
header('Content-Type: application/json');
session_start();
require_once '../config/db.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    // Get unread notifications first, then read ones
    $stmt = $pdo->prepare("
        SELECT id, type, message, link, is_read, created_at
        FROM notifications
        WHERE user_id = ?
        ORDER BY is_read ASC, created_at DESC
        LIMIT 50
    ");
    $stmt->execute([$user_id]);
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Count unread
    $unreadStmt = $pdo->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0");
    $unreadStmt->execute([$user_id]);
    $unreadCount = $unreadStmt->fetchColumn();

    echo json_encode([
        'success' => true,
        'data' => $notifications,
        'unread_count' => (int)$unreadCount
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>