<?php
session_start();
header('Content-Type: application/json');

$host = 'localhost';
$dbname = 'hrms_db';
$username = 'root';
$password = '';

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';
$password_input = $input['password'] ?? '';

if (empty($email) || empty($password_input)) {
    echo json_encode(['success' => false, 'message' => 'All fields required']);
    exit;
}

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($password_input, $user['password'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        exit;
    }

    $_SESSION['user_id'] = $user['id'];
    $_SESSION['employee_id'] = $user['employee_id'];
    $_SESSION['name'] = $user['name'];
    $_SESSION['role'] = $user['role'];

    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $user['id'],
            'employee_id' => $user['employee_id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role']
        ]
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
?>