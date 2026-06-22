<?php
header('Content-Type: application/json');
session_start();
require_once '../config/db.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

try {
    // Get employees who:
    // 1. Have time-in today (attendance.timestamp = CURDATE())
    // 2. Have NOT time-out yet (attendance.time_out IS NULL)
    // 3. Are NOT assigned to any job order (employees.current_job_order_id IS NULL)
    $sql = "
        SELECT 
            e.id, 
            e.name, 
            e.position, 
            e.department, 
            e.daily_rate,
            e.status,
            a.timestamp as time_in,
            a.id as attendance_id
        FROM employees e
        INNER JOIN attendance a ON a.employee_id = e.id
        WHERE DATE(a.timestamp) = CURDATE() 
          AND a.time_out IS NULL
          AND e.current_job_order_id IS NULL
          AND e.status != 'Inactive'
        ORDER BY e.name ASC
    ";

    $stmt = $pdo->query($sql);
    $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $employees
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>