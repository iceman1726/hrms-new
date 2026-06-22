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
// Select only columns that exist in your table (from earlier screenshot)
$sql = "SELECT 
            id, ticket_no, start_date, location, assigned_team, 
            work_schedule, service_vehicle, plate_number, 
            activity_type, description_activity, dispatcher, 
            endorsed_time, restored_time, condition_facility, 
            materials, action_taken, remarks, 
            before_photo, after_photo, status, created_at 
        FROM job_orders 
        WHERE status = 'Completed' 
        ORDER BY created_at DESC";
$result = $conn->query($sql);
$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}
echo json_encode(['success'=>true, 'data'=>$data]);
$conn->close();
?>