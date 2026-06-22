<?php
header('Content-Type: application/json');
require_once '../config/db.php'; // using PDO from config

try {
    // Fetch all job orders with status != 'Completed'
    // Include all relevant columns (add morning_team, night_team, etc.)
    $sql = "
        SELECT 
            id, 
            ticket_no, 
            location, 
            start_date, 
            assigned_team, 
            morning_team, 
            night_team, 
            status, 
            project_name, 
            activity_type,
            description_activity,
            dispatcher,
            endorsed_time,
            restored_time,
            condition_facility,
            materials,
            action_taken,
            remarks,
            before_photo,
            after_photo,
            created_at,
            completed_at
        FROM job_orders 
        WHERE status != 'Completed' 
        ORDER BY created_at DESC
    ";

    $stmt = $pdo->query($sql);
    $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // For each job, get the list of assigned employees
    foreach ($jobs as &$job) {
        $assignedSql = "
            SELECT GROUP_CONCAT(name SEPARATOR ', ') as names
            FROM employees 
            WHERE current_job_order_id = ?
        ";
        $assignedStmt = $pdo->prepare($assignedSql);
        $assignedStmt->execute([$job['id']]);
        $result = $assignedStmt->fetch(PDO::FETCH_ASSOC);
        $job['assigned_employees'] = $result['names'] ?: 'None';
    }

    echo json_encode([
        'success' => true,
        'data' => $jobs
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>