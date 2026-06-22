<?php
header('Content-Type: application/json');
require_once 'notification_helper.php';

$host = 'localhost';
$user = 'root';
$pass = '';
$db = 'hrms_db';
$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'DB connection failed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$id = $input['id'] ?? 0;
$status = $input['status'] ?? '';

if (!$id || !$status) {
    echo json_encode(['success' => false, 'message' => 'Missing id or status']);
    exit;
}

// Update the leave request status
$stmt = $conn->prepare("UPDATE leave_requests SET status = ? WHERE id = ?");
$stmt->bind_param("si", $status, $id);

if ($stmt->execute()) {
    // ---- Fetch leave request details for notification ----
    $detailsStmt = $conn->prepare("SELECT employee_id, employee_name, type, start_date, end_date FROM leave_requests WHERE id = ?");
    $detailsStmt->bind_param("i", $id);
    $detailsStmt->execute();
    $result = $detailsStmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        $employee_id = $row['employee_id'];
        $employee_name = $row['employee_name'];
        $type = $row['type'];
        $start_date = $row['start_date'];
        $end_date = $row['end_date'];

        // Create notification message based on status
        if ($status === 'approved') {
            $message = "Your leave request ({$type}) from {$start_date} to {$end_date} has been approved.";
            $typeNotif = 'leave_approved';
        } elseif ($status === 'rejected') {
            $message = "Your leave request ({$type}) from {$start_date} to {$end_date} has been rejected.";
            $typeNotif = 'leave_rejected';
        } else {
            $message = null;
        }

        if ($message && $employee_id) {
            // Send notification to the employee
            $link = '/employee/leave-requests.html';
            createNotification($employee_id, $typeNotif, $message, $link);
        }
    }
    $detailsStmt->close();

    echo json_encode(['success' => true, 'message' => 'Leave request updated']);
} else {
    echo json_encode(['success' => false, 'message' => $stmt->error]);
}

$stmt->close();
$conn->close();
?>