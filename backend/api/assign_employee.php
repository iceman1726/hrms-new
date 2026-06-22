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
$job_order_id = $input['job_order_id'] ?? null;

if (!$employee_id || !$job_order_id) {
    echo json_encode(['success' => false, 'message' => 'Employee ID and Job Order ID required']);
    exit;
}

try {
    $pdo->beginTransaction();

    // Check if employee is available
    $check = $pdo->prepare("
        SELECT e.id, a.id as attendance_id
        FROM employees e
        INNER JOIN attendance a ON a.employee_id = e.id
        WHERE e.id = ? 
          AND DATE(a.timestamp) = CURDATE() 
          AND a.time_out IS NULL
          AND e.current_job_order_id IS NULL
          AND e.status != 'Inactive'
    ");
    $check->execute([$employee_id]);
    if ($check->rowCount() === 0) {
        throw new Exception('Employee is not available for assignment');
    }

    // Assign employee to job order
    $update = $pdo->prepare("UPDATE employees SET current_job_order_id = ? WHERE id = ?");
    $update->execute([$job_order_id, $employee_id]);

    // Update job order status to 'In Progress' if not already
    $jobStatus = $pdo->prepare("UPDATE job_orders SET status = 'In Progress' WHERE id = ? AND status = 'Pending'");
    $jobStatus->execute([$job_order_id]);

    $pdo->commit();

    // ---- Send notification to the employee ----
    // Fetch employee name
    $empStmt = $pdo->prepare("SELECT name FROM employees WHERE id = ?");
    $empStmt->execute([$employee_id]);
    $empName = $empStmt->fetchColumn();

    // Fetch job ticket
    $jobStmt = $pdo->prepare("SELECT ticket_no, project_name FROM job_orders WHERE id = ?");
    $jobStmt->execute([$job_order_id]);
    $job = $jobStmt->fetch(PDO::FETCH_ASSOC);
    $ticket = $job['ticket_no'] ?? 'N/A';
    $project = $job['project_name'] ?? '';

    // Get user_id from users table using employee_id
    $userStmt = $pdo->prepare("SELECT id FROM users WHERE employee_id = ?");
    $userStmt->execute([$employee_id]);
    $user_id = $userStmt->fetchColumn();

    if ($user_id) {
        $message = "You have been assigned to job order #{$ticket}" . ($project ? " ({$project})" : "");
        createNotification($user_id, 'job_assigned', $message, '/employee/deployment-history.html');
    }

    echo json_encode([
        'success' => true,
        'message' => 'Employee assigned successfully'
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>