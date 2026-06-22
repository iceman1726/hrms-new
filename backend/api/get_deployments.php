<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$host = 'localhost';
$dbname = 'hrms_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $employee_id = isset($_GET['employee_id']) ? $_GET['employee_id'] : '';

    // Since deployments table doesn't have employee_id, return empty for now
    // When you add employee-to-deployment linking, you'll update this query
    echo json_encode([
        'success' => true,
        'data' => [],
        'message' => 'No deployments found for this employee.'
    ]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>