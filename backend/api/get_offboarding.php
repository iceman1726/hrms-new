<?php
header('Content-Type: application/json');
require_once '../config/db.php';

$stmt = $pdo->query("
    SELECT o.*, e.name as employee_name, e.position 
    FROM offboarding o 
    JOIN employees e ON o.employee_id = e.id 
    ORDER BY o.offboard_date DESC
");
$offboarding = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode(['success' => true, 'data' => $offboarding]);
?>