<?php
require_once __DIR__ . '/backend/config/db.php';

// 1. Check if employee ID 1 exists, if not create one
$stmt = $pdo->prepare("SELECT id FROM employees WHERE id = 1");
$stmt->execute();
if ($stmt->rowCount() == 0) {
    $stmt = $pdo->prepare("INSERT INTO employees (id, name, daily_rate) VALUES (1, 'Test Employee', 500)");
    $stmt->execute();
    echo "✅ Created employee ID 1 (Daily Rate: ₱500)<br>";
} else {
    echo "✅ Employee ID 1 already exists<br>";
}

// 2. Insert ONE attendance record for June 1, 2026
$stmt = $pdo->prepare("
    INSERT INTO attendance (employee_id, timestamp) 
    VALUES (1, '2026-06-01 08:00:00')
");
$stmt->execute();
echo "✅ Inserted 1 attendance record for June 1, 2026<br>";

echo "<br>🎯 Now go to Payroll page, select 1st-15th, June 2026, and click Compute.";
echo "<br>It will show 1 employee with 1 day present.";
?>