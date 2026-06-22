<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$host = 'localhost';
$dbname = 'hrms_db';   // ← ITO ANG BINAGO KO (dati hrmss_db)
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $employee_id = isset($_GET['employee_id']) ? $_GET['employee_id'] : '';

    if (empty($employee_id)) {
        echo json_encode([
            'success' => false,
            'message' => 'Employee ID is required'
        ]);
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM payroll WHERE employee_id = :employee_id ORDER BY created_at DESC");
    $stmt->execute(['employee_id' => $employee_id]);
    $payroll = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $payroll
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>