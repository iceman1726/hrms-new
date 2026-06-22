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

// Get completed job orders (status = 'Completed')
$sql = "SELECT 
            id as job_order_id,
            project_name,
            location,
            assigned_team as team,
            status,
            start_date as completed_at,
            NULL as completion_photo
        FROM job_orders 
        WHERE status = 'Completed'
        ORDER BY start_date DESC";

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
    $row['completion_photo'] = null; // No photo field in job_orders
    $data[] = $row;
}

echo json_encode(['success'=>true, 'data'=>$data]);
$conn->close();
?>