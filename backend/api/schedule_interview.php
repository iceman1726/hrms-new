<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../email_helper.php';

$host = 'localhost';
$dbname = 'hrms_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $input = json_decode(file_get_contents('php://input'), true);
    $application_id = $input['id'] ?? 0;
    $interview_type = $input['interview_type'] ?? '';
    $interview_date = $input['interview_date'] ?? '';
    $interview_notes = $input['interview_notes'] ?? '';

    if (!$application_id || !$interview_type || !$interview_date) {
        echo json_encode(['success' => false, 'message' => 'All fields are required.']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM applications WHERE id = ?");
    $stmt->execute([$application_id]);
    $app = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$app) {
        echo json_encode(['success' => false, 'message' => 'Application not found.']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE applications SET 
        status = 'interview_scheduled',
        interview_type = ?, 
        interview_date = ?, 
        interview_notes = ? 
        WHERE id = ?");
    $stmt->execute([$interview_type, $interview_date, $interview_notes, $application_id]);

    // Send email to applicant
    $email_result = send_interview_email(
        $app['email'],
        $app['name'],
        $interview_type,
        $interview_date,
        $interview_notes
    );

    echo json_encode([
        'success' => true, 
        'message' => 'Interview scheduled! Email sent to ' . $app['email'],
        'email_status' => $email_result
    ]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>