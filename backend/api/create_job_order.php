<?php
header('Content-Type: application/json');
require_once 'notification_helper.php'; // Include notification helper

$host = 'localhost';
$user = 'root';
$pass = '';
$db = 'hrms_db';
$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    echo json_encode(['success'=>false, 'message'=>'DB connection failed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    echo json_encode(['success'=>false, 'message'=>'No data']);
    exit;
}

// Generate new ID (JO-xxx)
$maxQuery = "SELECT id FROM job_orders ORDER BY id DESC LIMIT 1";
$res = $conn->query($maxQuery);
$lastId = '';
if ($res && $res->num_rows > 0) {
    $row = $res->fetch_assoc();
    $lastId = $row['id'];
}
if (preg_match('/JO-(\d+)/', $lastId, $matches)) {
    $nextNum = $matches[1] + 1;
} else {
    $nextNum = 1;
}
$newId = 'JO-' . str_pad($nextNum, 3, '0', STR_PAD_LEFT);

// Map all fields
$ticket_no = $input['ticket_no'] ?? '';
$start_date = $input['start_date'] ?? null;
$location = $input['location'] ?? '';
$assigned_team = $input['assigned_team'] ?? '';
$work_schedule = $input['work_schedule'] ?? '';
$service_vehicle = $input['service_vehicle'] ?? '';
$plate_number = $input['plate_number'] ?? '';
$activity_type = $input['activity_type'] ?? '';
$description_activity = $input['description_activity'] ?? '';
$dispatcher = $input['dispatcher'] ?? '';
$endorsed_time = $input['endorsed_time'] ?? null;
$restored_time = $input['restored_time'] ?? null;
$condition_facility = $input['condition'] ?? '';
$materials = $input['materials'] ?? '';
$action_taken = $input['action_taken'] ?? '';
$remarks = $input['remarks'] ?? '';

if (!$ticket_no || !$start_date || !$activity_type) {
    echo json_encode(['success'=>false, 'message'=>'Ticket, Start Date, and Activity Type are required']);
    exit;
}

$sql = "INSERT INTO job_orders (
    id, ticket_no, start_date, location, assigned_team, work_schedule, service_vehicle, plate_number,
    activity_type, description_activity, dispatcher, endorsed_time, restored_time,
    condition_facility, materials, action_taken, remarks, status, created_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())";
$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "sssssssssssssssss",
    $newId, $ticket_no, $start_date, $location, $assigned_team,
    $work_schedule, $service_vehicle, $plate_number,
    $activity_type, $description_activity, $dispatcher,
    $endorsed_time, $restored_time, $condition_facility,
    $materials, $action_taken, $remarks
);

if ($stmt->execute()) {
    // ---- NOTIFICATION: Notify all Coordinators ----
    // Fetch all coordinator user IDs
    $coordStmt = $conn->prepare("SELECT id FROM users WHERE role = 'coordinator'");
    $coordStmt->execute();
    $coords = $coordStmt->get_result();

    $message = "New job order #{$ticket_no} created (ID: {$newId})";
    $link = '/coordinator/job-orders.html';

    while ($row = $coords->fetch_assoc()) {
        createNotification($row['id'], 'job_created', $message, $link);
    }
    $coordStmt->close();

    echo json_encode(['success'=>true, 'message'=>'Job order created', 'id'=>$newId]);
} else {
    echo json_encode(['success'=>false, 'message'=>'DB error: '.$stmt->error]);
}

$stmt->close();
$conn->close();
?>