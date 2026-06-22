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

    $input = json_decode(file_get_contents('php://input'), true);

    $name = $input['name'] ?? '';
    $email = $input['email'] ?? '';
    $phone = $input['phone'] ?? '';
    $position = $input['position'] ?? '';
    $experience = $input['experience'] ?? '';
    $date_of_birth = $input['date_of_birth'] ?? null;
    $address = $input['address'] ?? '';
    $years_experience = $input['years_experience'] ?? 0;
    $skills = $input['skills'] ?? '';
    $emergency_contact = $input['emergency_contact'] ?? '';
    $emergency_phone = $input['emergency_phone'] ?? '';

    if (empty($name) || empty($email)) {
        echo json_encode(['success' => false, 'message' => 'Name and email are required.']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO applications 
        (name, email, phone, position_applied, experience, date_of_birth, address, years_experience, skills, emergency_contact, emergency_phone) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $name, $email, $phone, $position, $experience,
        $date_of_birth, $address, $years_experience,
        $skills, $emergency_contact, $emergency_phone
    ]);

    echo json_encode(['success' => true, 'message' => 'Application submitted successfully!']);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>