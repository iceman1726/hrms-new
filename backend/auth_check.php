<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: /hrms/login.html');
    exit;
}

// Get user data for dashboard display
$user_id = $_SESSION['user_id'];
$user_name = $_SESSION['name'] ?? 'User';
$user_role = $_SESSION['role'] ?? '';
$user_employee_id = $_SESSION['employee_id'] ?? '';
?>