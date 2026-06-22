<?php
header('Content-Type: application/json');
require_once '../config/db.php';

$stmt = $pdo->query("
    SELECT a.*, e.name as employee_name 
    FROM attendance a 
    JOIN employees e ON a.employee_id = e.id 
    ORDER BY a.timestamp DESC
");
$attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode(['success' => true, 'data' => $attendance]);
?>