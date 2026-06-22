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
    $application_id = $input['application_id'] ?? 0;
    $employee_id = $input['employee_id'] ?? '';
    $email = $input['email'] ?? '';
    $role = $input['role'] ?? 'employee';
    $daily_rate = $input['daily_rate'] ?? 0;

    if (!$application_id || empty($employee_id) || empty($email)) {
        echo json_encode(['success' => false, 'message' => 'Application ID, Employee ID, and Email are required.']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM applications WHERE id = ?");
    $stmt->execute([$application_id]);
    $app = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$app) {
        echo json_encode(['success' => false, 'message' => 'Application not found.']);
        exit;
    }

    $check = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $check->execute([$email]);
    if ($check->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Email already exists.']);
        exit;
    }

    $hashed = password_hash('password', PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (employee_id, username, email, password, name, position, role) 
                           VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$employee_id, $email, $email, $hashed, $app['name'], $app['position_applied'], $role]);

    $today = date('Y-m-d');

    // Insert into employees WITH daily_rate
    $stmt = $pdo->prepare("INSERT INTO employees (employee_id, name, position, status, onboard_date, daily_rate) 
                           VALUES (?, ?, ?, 'Active', ?, ?)");
    $stmt->execute([$employee_id, $app['name'], $app['position_applied'], $today, $daily_rate]);

    $stmt = $pdo->prepare("UPDATE applications SET status = 'approved' WHERE id = ?");
    $stmt->execute([$application_id]);

    echo json_encode([
        'success' => true, 
        'message' => 'Account created! Employee onboarded with daily rate ₱' . number_format($daily_rate, 2),
        'employee_id' => $employee_id
    ]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>