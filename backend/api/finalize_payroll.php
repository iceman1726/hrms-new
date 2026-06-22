<?php
header('Content-Type: application/json');
require_once '../config/db.php';

$input = file_get_contents('php://input');
$data = json_decode($input, true);

$periodStart = $data['period_start'] ?? null;
$periodEnd = $data['period_end'] ?? null;
$payrollData = $data['data'] ?? [];

if (!$periodStart || !$periodEnd || empty($payrollData)) {
    echo json_encode(['success' => false, 'message' => 'Missing required data']);
    exit;
}

$payPeriod = $periodStart . ' to ' . $periodEnd;

try {
    $stmt = $pdo->prepare("DELETE FROM payroll WHERE pay_period = ?");
    $stmt->execute([$payPeriod]);
    
    foreach ($payrollData as $item) {
        $stmt = $pdo->prepare("
            INSERT INTO payroll (
                employee_id, pay_period, days_present, gross_pay, net_pay,
                sss, philhealth, pagbig, withholding_tax,
                ot_hours, undertime_hours, ot_pay, undertime_deduction, finalized
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        ");
        $stmt->execute([
            $item['employee_id'],
            $payPeriod,
            $item['days_present'],
            $item['gross'],
            $item['net'],
            $item['sss'],
            $item['philhealth'],
            $item['pagibig'],
            $item['withholding_tax'],
            $item['ot_hours'],
            $item['undertime_hours'],
            $item['ot_pay'],
            $item['undertime_deduction']
        ]);
    }
    
    echo json_encode(['success' => true, 'message' => 'Payroll finalized successfully']);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>