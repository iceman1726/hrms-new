<?php
header('Content-Type: application/json');
$host = 'localhost';
$dbname = 'hrms_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $input = json_decode(file_get_contents('php://input'), true);
    $application_id = $input['id'] ?? 0;

    if (!$application_id) {
        echo json_encode(['success' => false, 'message' => 'Application ID required.']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE applications SET status = 'approved' WHERE id = ?");
    $stmt->execute([$application_id]);

    echo json_encode(['success' => true, 'message' => 'Application approved! Please create an account.']);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>