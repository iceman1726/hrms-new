<?php
header('Content-Type: application/json');
session_start();
require_once '../config/db.php';
require_once 'notification_helper.php'; // Include notification helper

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$employee_id = $input['employee_id'] ?? null;

if (!$employee_id) {
    echo json_encode(['success' => false, 'message' => 'Employee ID required']);
    exit;
}

try {
    // Record time-out
    $update = $pdo->prepare("
        UPDATE attendance 
        SET time_out = NOW() 
        WHERE employee_id = ? 
          AND DATE(timestamp) = CURDATE() 
          AND time_out IS NULL
    ");
    $update->execute([$employee_id]);

    if ($update->rowCount() === 0) {
        throw new Exception('No active time-in found for this employee');
    }

    // Free employee from current job assignment
    $free = $pdo->prepare("
        UPDATE employees 
        SET current_job_order_id = NULL 
        WHERE id = ? AND current_job_order_id IS NOT NULL
    ");
    $free->execute([$employee_id]);

    // ---- NOTIFICATION: Notify coordinators that employee is now available ----
    // Fetch employee name
    $empStmt = $pdo->prepare("SELECT name FROM employees WHERE id = ?");
    $empStmt->execute([$employee_id]);
    $empName = $empStmt->fetchColumn();

    // Get all coordinator user IDs
    $coordStmt = $pdo->prepare("SELECT id FROM users WHERE role = 'coordinator'");
    $coordStmt->execute();
    $coords = $coordStmt->fetchAll(PDO::FETCH_ASSOC);

    $message = "Employee {$empName} has timed out and is now available for assignment.";
    $link = '/coordinator/dashboard.php';

    foreach ($coords as $coord) {
        createNotification($coord['id'], 'employee_timeout', $message, $link);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Time-out recorded successfully'
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>