<?php
header('Content-Type: application/json');
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
$employeeId = $input['employee_id'] ?? 0;
if (!$employeeId) {
    echo json_encode(['success'=>false, 'message'=>'No employee ID']);
    exit;
}
// Set current_team to NULL (or empty string) to remove from team
$sql = "UPDATE employees SET current_team = NULL WHERE id = $employeeId";
if ($conn->query($sql) === TRUE) {
    echo json_encode(['success'=>true, 'message'=>'Employee removed from team']);
} else {
    echo json_encode(['success'=>false, 'message'=>$conn->error]);
}
$conn->close();
?>