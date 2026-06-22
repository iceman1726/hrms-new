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
$deploymentId = $input['deployment_id'] ?? 0;
if (!$deploymentId) {
    echo json_encode(['success'=>false, 'message'=>'No deployment ID']);
    exit;
}
$sql = "UPDATE deployments SET status = 'Completed', submitted_at = NOW() WHERE id = $deploymentId";
if ($conn->query($sql) === TRUE) {
    echo json_encode(['success'=>true, 'message'=>'Completed']);
} else {
    echo json_encode(['success'=>false, 'message'=>$conn->error]);
}
$conn->close();
?>