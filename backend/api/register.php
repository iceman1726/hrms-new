<?php
header('Content-Type: application/json');
$input = json_decode(file_get_contents('php://input'), true);

$host = 'localhost';
$dbname = 'hrms_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $name = $input['name'];
    $email = $input['email'];
    $employee_id = $input['employee_id'];
    $position = $input['position'];
    $role = $input['role'] ?? 'employee';
    $daily_rate = $input['daily_rate'] ?? 0;
    $password_hash = password_hash($input['password'], PASSWORD_DEFAULT);
    $today = date('Y-m-d');

    // Check if email already exists
    $check = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $check->execute([$email]);
    if ($check->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Email already exists.']);
        exit;
    }

    // Check if employee_id already exists
    $check = $pdo->prepare("SELECT id FROM users WHERE employee_id = ?");
    $check->execute([$employee_id]);
    if ($check->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Employee ID already exists.']);
        exit;
    }

    // Insert into users
    $stmt = $pdo->prepare("INSERT INTO users (employee_id, username, email, password, name, position, role) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$employee_id, $email, $email, $password_hash, $name, $position, $role]);

    // Insert into employees with daily_rate
    $stmt = $pdo->prepare("INSERT INTO employees (employee_id, name, position, status, onboard_date, daily_rate) VALUES (?, ?, ?, 'Active', ?, ?)");
    $stmt->execute([$employee_id, $name, $position, $today, $daily_rate]);

    echo json_encode([
        'success' => true, 
        'message' => 'Account created! Daily rate: ₱' . number_format($daily_rate, 2)
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>