<?php
header('Content-Type: application/json');
require_once '../config/db.php';
require_once 'notification_helper.php'; // Include notification helper

$data = json_decode(file_get_contents('php://input'), true);
$employee_id = $data['employee_id'] ?? null;
$offboard_date = $data['offboard_date'] ?? null;
$reason = $data['reason'] ?? '';
$remarks = $data['remarks'] ?? '';

if (!$employee_id || !$offboard_date) {
    echo json_encode(['success' => false, 'message' => 'Employee ID and offboard date required']);
    exit;
}

try {
    // Insert offboarding record
    $stmt = $pdo->prepare("INSERT INTO offboarding (employee_id, offboard_date, reason, remarks) VALUES (?, ?, ?, ?)");
    $stmt->execute([$employee_id, $offboard_date, $reason, $remarks]);

    // ---- NOTIFICATION: Notify HR about offboarding ----
    // Fetch employee name
    $empStmt = $pdo->prepare("SELECT name FROM employees WHERE id = ?");
    $empStmt->execute([$employee_id]);
    $empName = $empStmt->fetchColumn();

    // Get all HR user IDs
    $hrStmt = $pdo->prepare("SELECT id FROM users WHERE role = 'hr'");
    $hrStmt->execute();
    $hrUsers = $hrStmt->fetchAll(PDO::FETCH_ASSOC);

    $message = "Employee {$empName} has been offboarded (Reason: {$reason})";
    $link = '/hr/offboarding-history.html';

    foreach ($hrUsers as $hr) {
        createNotification($hr['id'], 'employee_offboarded', $message, $link);
    }

    echo json_encode(['success' => true, 'message' => 'Offboarding record saved']);

} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>