<?php
header('Content-Type: application/json');
require_once '../config/db.php';

$input = json_decode(file_get_contents('php://input'), true);
$start_date = $input['start_date'] ?? null;
$end_date = $input['end_date'] ?? null;

if (!$start_date || !$end_date) {
    echo json_encode(['success' => false, 'message' => 'Start date and end date required']);
    exit;
}

// Shift schedule: 8:00 AM to 5:00 PM (8 working hours)
$shift_start = '08:00:00';
$shift_end = '17:00:00';
$regular_hours = 8;

$stmt = $pdo->query("SELECT id, name, daily_rate FROM employees");
$employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

$results = [];

foreach ($employees as $emp) {
    // Get all attendance records for this employee in the period
    $stmt = $pdo->prepare("
        SELECT timestamp 
        FROM attendance 
        WHERE employee_id = ? AND DATE(timestamp) BETWEEN ? AND ?
        ORDER BY timestamp ASC
    ");
    $stmt->execute([$emp['id'], $start_date, $end_date]);
    $records = $stmt->fetchAll(PDO::FETCH_COLUMN);

    if (empty($records)) {
        $results[] = [
            'employee_id' => $emp['id'],
            'name' => $emp['name'],
            'daily_rate' => (float)$emp['daily_rate'],
            'days_present' => 0,
            'gross' => 0,
            'sss' => 0,
            'philhealth' => 0,
            'pagibig' => 0,
            'withholding_tax' => 0,
            'net' => 0,
            'ot_hours' => 0,
            'undertime_hours' => 0,
            'ot_pay' => 0,
            'undertime_deduction' => 0
        ];
        continue;
    }

    // Group by day
    $daily_punches = [];
    foreach ($records as $ts) {
        $date = date('Y-m-d', strtotime($ts));
        $time = date('H:i:s', strtotime($ts));
        $daily_punches[$date][] = $time;
    }

    $total_days = 0;
    $total_ot_hours = 0;
    $total_undertime_hours = 0;

    foreach ($daily_punches as $date => $punches) {
        // First punch = time in, last punch = time out
        $time_in = min($punches);
        $time_out = max($punches);
        
        $in_ts = strtotime($time_in);
        $out_ts = strtotime($time_out);
        $worked_seconds = $out_ts - $in_ts;
        $worked_hours = $worked_seconds / 3600;
        
        // Count as 1 workday regardless of hours
        $total_days += 1;

        // OT: if time_out > shift_end
        $shift_end_ts = strtotime($shift_end);
        if ($out_ts > $shift_end_ts) {
            $ot_seconds = $out_ts - $shift_end_ts;
            $ot_hours = $ot_seconds / 3600;
            $total_ot_hours += $ot_hours;
        }

        // Undertime: if time_out < shift_end and worked_hours < 8
        if ($out_ts < $shift_end_ts && $worked_hours < $regular_hours) {
            $undertime_seconds = $shift_end_ts - $out_ts;
            $undertime_hours = $undertime_seconds / 3600;
            // Cap undertime to regular_hours - worked_hours (should be the same)
            $total_undertime_hours += $undertime_hours;
        }
    }

    // Calculate pay
    $daily_rate = (float)$emp['daily_rate'];
    $hourly_rate = $daily_rate / 8;

    $gross = $daily_rate * $total_days; // base salary for days present
    $ot_rate_multiplier = 1.25; // OT rate: 1.25x hourly (can be changed to 1.5)
    $ot_pay = $total_ot_hours * $hourly_rate * $ot_rate_multiplier;
    $undertime_deduction = $total_undertime_hours * $hourly_rate;

    $gross_with_ot = $gross + $ot_pay - $undertime_deduction;

    // Deductions (based on gross_with_ot)
    $sss = $gross_with_ot * 0.05;
    $philhealth = $gross_with_ot * 0.025;
    $pagibig = $gross_with_ot * 0.02;
    if ($pagibig > 100) $pagibig = 100;
    $wt = 0;
    if ($gross_with_ot > 20000) $wt = ($gross_with_ot - 20000) * 0.10;
    $net = $gross_with_ot - ($sss + $philhealth + $pagibig + $wt);

    $results[] = [
        'employee_id' => $emp['id'],
        'name' => $emp['name'],
        'daily_rate' => $daily_rate,
        'days_present' => $total_days,
        'gross' => round($gross_with_ot, 2),
        'sss' => round($sss, 2),
        'philhealth' => round($philhealth, 2),
        'pagibig' => round($pagibig, 2),
        'withholding_tax' => round($wt, 2),
        'net' => round($net, 2),
        'ot_hours' => round($total_ot_hours, 2),
        'undertime_hours' => round($total_undertime_hours, 2),
        'ot_pay' => round($ot_pay, 2),
        'undertime_deduction' => round($undertime_deduction, 2)
    ];
}

echo json_encode(['success' => true, 'data' => $results]);
?>