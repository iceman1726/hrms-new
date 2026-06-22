<?php
header('Content-Type: application/json');
session_start();

$host = 'localhost';
$user = 'root';
$pass = '';
$db = 'hrms_db';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    echo json_encode(['success'=>false, 'message'=>'Database connection failed']);
    exit;
}

// Get only deployments with status = 'Active'
$sql = "SELECT 
            id, 
            job_order_id, 
            team_name AS team, 
            status, 
            shift,
            submitted_at AS start_date
        FROM deployments 
        WHERE status = 'Active'
        ORDER BY submitted_at DESC";

$result = $conn->query($sql);
if (!$result) {
    echo json_encode(['success'=>false, 'message'=>'SQL error: ' . $conn->error]);
    exit;
}

$data = [];
while ($row = $result->fetch_assoc()) {
    // Get employees assigned to this team
    $team = $row['team'];
    $empSql = "SELECT name FROM employees WHERE current_team = '$team'";
    $empResult = $conn->query($empSql);
    $employeeNames = [];
    if ($empResult && $empResult->num_rows > 0) {
        while ($emp = $empResult->fetch_assoc()) {
            $employeeNames[] = $emp['name'];
        }
    }
    $row['employee_names'] = implode(', ', $employeeNames);
    $data[] = $row;
}

echo json_encode(['success'=>true, 'data'=>$data]);
$conn->close();
?>