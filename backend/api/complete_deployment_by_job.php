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
$jobOrderId = $input['job_order_id'] ?? 0;

if (!$jobOrderId) {
    echo json_encode(['success'=>false, 'message'=>'Missing job order ID']);
    exit;
}

// Find the deployment for this job order
$findSql = "SELECT id FROM deployments WHERE job_order_id = '$jobOrderId'";
$findResult = $conn->query($findSql);
if ($findResult && $findResult->num_rows > 0) {
    $row = $findResult->fetch_assoc();
    $deploymentId = $row['id'];
    // Update deployment status to 'Completed'
    $updateSql = "UPDATE deployments SET status = 'Completed', submitted_at = NOW() WHERE id = $deploymentId";
    if ($conn->query($updateSql) === TRUE) {
        echo json_encode(['success'=>true, 'message'=>'Deployment completed']);
    } else {
        echo json_encode(['success'=>false, 'message'=>'Failed to update deployment: ' . $conn->error]);
    }
} else {
    echo json_encode(['success'=>false, 'message'=>'No deployment found for this job order']);
}
$conn->close();
?>