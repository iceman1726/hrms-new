<?php
// notification_helper.php – Reusable function to create notifications
require_once '../config/db.php';

/**
 * Create a notification for a specific user
 * 
 * @param int $user_id  The user who will receive the notification
 * @param string $type  e.g., 'leave_submitted', 'job_assigned', 'leave_approved'
 * @param string $message  The notification text
 * @param string|null $link  Optional URL to redirect to when clicked
 * @return bool  True if inserted successfully
 */
function createNotification($user_id, $type, $message, $link = null) {
    global $pdo;
    
    if (!$user_id || !$type || !$message) {
        return false;
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO notifications (user_id, type, message, link) 
            VALUES (?, ?, ?, ?)
        ");
        return $stmt->execute([$user_id, $type, $message, $link]);
    } catch (PDOException $e) {
        // Log error (optional)
        error_log('Notification error: ' . $e->getMessage());
        return false;
    }
}
?>