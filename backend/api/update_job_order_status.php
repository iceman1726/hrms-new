<?php
header('Content-Type: application/json');
session_start();
require_once '../config/db.php';
require_once 'notification_helper.php'; // Include notification helper

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$job_id = $input['id'] ?? null;
$status = $input['status'] ?? null;

if (!$job_id || !$status) {
    echo json_encode(['success' => false, 'message' => 'Job ID and status required']);
    exit;
}

// Allowed statuses
$allowed = ['Pending', 'Dispatched', 'In Progress', 'For Validation', 'Completed'];
if (!in_array($status, $allowed)) {
    echo json_encode(['success' => false, 'message' => 'Invalid status']);
    exit;
}

try {
    $pdo->beginTransaction();

    // Update job order status
    $update = $pdo->prepare("UPDATE job_orders SET status = ? WHERE id = ?");
    $update->execute([$status, $job_id]);

    // If job is completed, free all assigned employees
    if ($status === 'Completed') {
        $free = $pdo->prepare("
            UPDATE employees 
            SET current_job_order_id = NULL 
            WHERE current_job_order_id = ?
        ");
        $free->execute([$job_id]);

        // Set completion timestamp
        $complete = $pdo->prepare("UPDATE job_orders SET completed_at = NOW() WHERE id = ?");
        $complete->execute([$job_id]);

        // ---- NOTIFICATION: Notify HR about completed job ----
        // Fetch job details
        $jobStmt = $pdo->prepare("SELECT ticket_no, project_name FROM job_orders WHERE id = ?");
        $jobStmt->execute([$job_id]);
        $job = $jobStmt->fetch(PDO::FETCH_ASSOC);
        $ticket = $job['ticket_no'] ?? 'N/A';
        $project = $job['project_name'] ?? '';

        // Get HR user(s)
        $hrStmt = $pdo->prepare("SELECT id FROM users WHERE role = 'hr'");
        $hrStmt->execute();
        $hrUsers = $hrStmt->fetchAll(PDO::FETCH_ASSOC);

        $message = "Job order #{$ticket}" . ($project ? " ({$project})" : "") . " has been marked as Completed.";
        foreach ($hrUsers as $hr) {
            createNotification($hr['id'], 'job_completed', $message, '/hr/reports.html');
        }
    }

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Job order status updated to ' . $status
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>