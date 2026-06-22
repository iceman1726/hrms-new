<?php
header('Content-Type: application/json');
require_once 'notification_helper.php'; // Include notification helper

$host = 'localhost';
$user = 'root';
$pass = '';
$db = 'hrms_db';
$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'DB connection failed']);
    exit;
}

$jobId = $_POST['job_id'] ?? null;
$photoType = $_POST['photo_type'] ?? null;

if (!$jobId || !$photoType || !isset($_FILES['photo'])) {
    echo json_encode(['success' => false, 'message' => 'Missing parameters']);
    exit;
}

$uploadDir = dirname(__DIR__) . '/uploads/';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

$ext = strtolower(pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION));
$allowed = ['jpg', 'jpeg', 'png'];
if (!in_array($ext, $allowed)) {
    echo json_encode(['success' => false, 'message' => 'Only JPG, PNG, allowed']);
    exit;
}

$filename = 'job_' . $jobId . '_' . $photoType . '_' . time() . '.' . $ext;
$targetPath = $uploadDir . $filename;

if (move_uploaded_file($_FILES['photo']['tmp_name'], $targetPath)) {
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https" : "http";
    $serverHost = $_SERVER['HTTP_HOST'];
    $fileUrl = $protocol . "://" . $serverHost . '/hrms/backend/uploads/' . $filename;
    $column = ($photoType === 'before') ? 'before_photo' : 'after_photo';

    $stmt = $conn->prepare("UPDATE job_orders SET $column = ? WHERE id = ?");
    $stmt->bind_param("ss", $fileUrl, $jobId);

    if ($stmt->execute()) {
        // ---- NOTIFICATION: Notify HR about photo upload ----
        // Fetch job details
        $jobStmt = $conn->prepare("SELECT ticket_no, project_name FROM job_orders WHERE id = ?");
        $jobStmt->bind_param("s", $jobId);
        $jobStmt->execute();
        $jobResult = $jobStmt->get_result();
        $job = $jobResult->fetch_assoc();
        $ticket = $job['ticket_no'] ?? 'N/A';
        $project = $job['project_name'] ?? '';
        $jobStmt->close();

        // Get all HR user IDs
        $hrStmt = $conn->prepare("SELECT id FROM users WHERE role = 'hr'");
        $hrStmt->execute();
        $hrUsers = $hrStmt->get_result();

        $photoLabel = ucfirst($photoType);
        $message = "{$photoLabel} photo uploaded for job order #{$ticket}" . ($project ? " ({$project})" : "");
        $link = '/hr/reports.html';

        while ($row = $hrUsers->fetch_assoc()) {
            createNotification($row['id'], 'photo_uploaded', $message, $link);
        }
        $hrStmt->close();

        echo json_encode(['success' => true, 'message' => 'Photo uploaded', 'url' => $fileUrl]);
    } else {
        echo json_encode(['success' => false, 'message' => 'DB update failed: ' . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to move file']);
}

$conn->close();
?>