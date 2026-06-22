-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 22, 2026 at 10:24 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hrms_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `applications`
--

CREATE TABLE `applications` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `position_applied` varchar(50) NOT NULL,
  `experience` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `applied_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_of_birth` date DEFAULT NULL,
  `address` text DEFAULT NULL,
  `desired_salary` varchar(50) DEFAULT NULL,
  `education` varchar(100) DEFAULT NULL,
  `years_experience` int(11) DEFAULT NULL,
  `skills` text DEFAULT NULL,
  `emergency_contact` varchar(100) DEFAULT NULL,
  `emergency_phone` varchar(20) DEFAULT NULL,
  `referral_source` varchar(50) DEFAULT NULL,
  `interview_type` enum('Phone Call','On-site','Video Call') DEFAULT NULL,
  `interview_date` datetime DEFAULT NULL,
  `interview_notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `applications`
--

INSERT INTO `applications` (`id`, `name`, `email`, `phone`, `position_applied`, `experience`, `status`, `applied_at`, `date_of_birth`, `address`, `desired_salary`, `education`, `years_experience`, `skills`, `emergency_contact`, `emergency_phone`, `referral_source`, `interview_type`, `interview_date`, `interview_notes`) VALUES
(1, 'Meow', 'kwini420@gmail.com', '9919813437', 'Driver', 'Macho dansa', '', '2026-06-21 08:02:37', '1990-06-21', 'diyan lungs sa gedli', NULL, NULL, 77000, 'first skill', '09136598741', '032699874123', NULL, 'Phone Call', '2026-06-23 04:03:00', 'GENG GENG');

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `timestamp` datetime NOT NULL,
  `method` enum('Fingerprint','Facial recognition') NOT NULL,
  `is_adjusted` tinyint(1) DEFAULT 0,
  `original_timestamp` datetime DEFAULT NULL,
  `adjusted_by` int(11) DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `time_out` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `deployments`
--

CREATE TABLE `deployments` (
  `id` int(11) NOT NULL,
  `job_order_id` varchar(20) NOT NULL,
  `shift` enum('morning','night') NOT NULL,
  `team_name` varchar(50) DEFAULT NULL,
  `status` enum('Active','Completed','For Validation') DEFAULT 'Active',
  `before_photo` varchar(255) DEFAULT NULL,
  `after_photo` varchar(255) DEFAULT NULL,
  `completion_notes` text DEFAULT NULL,
  `submitted_at` datetime DEFAULT NULL,
  `validated_by_hr` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `position` enum('TL','LINEMAN','DRIVER','HELPER') NOT NULL,
  `department` varchar(50) DEFAULT NULL,
  `daily_rate` decimal(10,2) DEFAULT NULL,
  `monthly_rate` decimal(10,2) DEFAULT NULL,
  `status` enum('Active','On Leave','Probationary','Inactive') DEFAULT 'Active',
  `start_date` date DEFAULT NULL,
  `prob_end_date` date DEFAULT NULL,
  `current_team` varchar(50) DEFAULT NULL,
  `onboard_date` date DEFAULT NULL,
  `employee_id` varchar(20) DEFAULT NULL,
  `offboard_date` date DEFAULT NULL,
  `offboard_reason` text DEFAULT NULL,
  `current_job_order_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `name`, `position`, `department`, `daily_rate`, `monthly_rate`, `status`, `start_date`, `prob_end_date`, `current_team`, `onboard_date`, `employee_id`, `offboard_date`, `offboard_reason`, `current_job_order_id`) VALUES
(1, 'Employee 1', 'TL', 'Operations', 100.00, 31200.00, 'Active', NULL, NULL, 'Alpha', NULL, NULL, NULL, NULL, NULL),
(4, 'Employee 4', 'HELPER', 'Field', 700.00, 18200.00, 'On Leave', NULL, NULL, 'Bravo', NULL, NULL, NULL, NULL, NULL),
(6, 'Employee 5', 'LINEMAN', 'Field', 800.00, NULL, 'Active', NULL, NULL, 'Charlie', NULL, NULL, NULL, NULL, NULL),
(7, 'Employee 6', 'DRIVER', 'Logistics', 900.00, NULL, 'Active', NULL, NULL, 'Charlie', NULL, NULL, NULL, NULL, NULL),
(8, 'Employee 7', 'HELPER', 'Field', 0.00, NULL, 'Active', NULL, NULL, 'Delta', NULL, NULL, NULL, NULL, NULL),
(9, 'Employee 8', 'LINEMAN', 'Field', 800.00, NULL, 'Active', NULL, NULL, 'Delta', NULL, NULL, NULL, NULL, NULL),
(10, 'Employee 9', 'DRIVER', 'Logistics', 900.00, NULL, 'Active', NULL, NULL, 'Echo', NULL, NULL, NULL, NULL, NULL),
(200245698, 'ANDREI', '', 'null', 10.00, NULL, 'Active', NULL, NULL, 'Alpha', NULL, NULL, NULL, NULL, NULL),
(200245699, 'Manigguh', 'LINEMAN', 'null', 1738.00, NULL, 'Active', NULL, NULL, NULL, '2026-06-17', 'emp0008', NULL, NULL, NULL),
(200245700, 'NICOYU', '', NULL, 650.00, NULL, 'Active', NULL, NULL, NULL, '2026-06-17', 'emp0010', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `job_orders`
--

CREATE TABLE `job_orders` (
  `id` varchar(20) NOT NULL,
  `ticket_no` varchar(50) DEFAULT NULL,
  `project_name` varchar(100) NOT NULL,
  `location` varchar(100) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `assigned_team` varchar(50) DEFAULT NULL,
  `status` enum('Pending','Dispatched','In Progress','For Validation','Completed') DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `activity_type` varchar(100) DEFAULT NULL,
  `scope_of_work` varchar(100) DEFAULT NULL,
  `dispatcher` varchar(50) DEFAULT NULL,
  `distance` varchar(20) DEFAULT NULL,
  `affected_foc_link` varchar(200) DEFAULT NULL,
  `affected_network` varchar(50) DEFAULT NULL,
  `installation_method` varchar(50) DEFAULT NULL,
  `severity` varchar(20) DEFAULT NULL,
  `endorsed_time` time DEFAULT NULL,
  `restored_time` time DEFAULT NULL,
  `condition_facility` varchar(50) DEFAULT NULL,
  `materials` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `assigned_cqm` varchar(100) DEFAULT NULL,
  `personnel_names` text DEFAULT NULL,
  `work_schedule` varchar(50) DEFAULT NULL,
  `service_vehicle` varchar(100) DEFAULT NULL,
  `plate_number` varchar(20) DEFAULT NULL,
  `special_machine` varchar(100) DEFAULT NULL,
  `activity_location` varchar(200) DEFAULT NULL,
  `location_ref` varchar(100) DEFAULT NULL,
  `description_activity` text DEFAULT NULL,
  `reason_outage` varchar(200) DEFAULT NULL,
  `action_taken` text DEFAULT NULL,
  `reported_by` varchar(100) DEFAULT NULL,
  `before_photo` varchar(255) DEFAULT NULL,
  `after_photo` varchar(255) DEFAULT NULL,
  `morning_team` varchar(50) DEFAULT NULL,
  `night_team` varchar(50) DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `job_orders`
--

INSERT INTO `job_orders` (`id`, `ticket_no`, `project_name`, `location`, `start_date`, `end_date`, `assigned_team`, `status`, `created_at`, `activity_type`, `scope_of_work`, `dispatcher`, `distance`, `affected_foc_link`, `affected_network`, `installation_method`, `severity`, `endorsed_time`, `restored_time`, `condition_facility`, `materials`, `remarks`, `assigned_cqm`, `personnel_names`, `work_schedule`, `service_vehicle`, `plate_number`, `special_machine`, `activity_location`, `location_ref`, `description_activity`, `reason_outage`, `action_taken`, `reported_by`, `before_photo`, `after_photo`, `morning_team`, `night_team`, `completed_at`) VALUES
('', 'TEST-001', 'Test Project', 'Office A', NULL, NULL, NULL, 'Completed', '2026-06-19 04:40:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `leave_requests`
--

CREATE TABLE `leave_requests` (
  `id` int(11) NOT NULL,
  `employee_name` varchar(100) DEFAULT NULL,
  `employee_id` varchar(50) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `position` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leave_requests`
--

INSERT INTO `leave_requests` (`id`, `employee_name`, `employee_id`, `type`, `start_date`, `end_date`, `reason`, `status`, `reviewed_by`, `reviewed_at`, `created_at`, `position`) VALUES
(1, 'NicoYu', 'emp0010', 'Sick Leave', '2026-06-17', '2026-06-17', 'MAMIMINGER', 'rejected', NULL, NULL, '2026-06-17 09:18:35', 'MAMIMINGER');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `offboarding`
--

CREATE TABLE `offboarding` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `offboard_date` date NOT NULL,
  `reason` varchar(100) NOT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payroll`
--

CREATE TABLE `payroll` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `pay_period` varchar(100) NOT NULL,
  `days_present` int(11) DEFAULT 0,
  `gross_pay` decimal(10,2) DEFAULT 0.00,
  `net_pay` decimal(10,2) DEFAULT 0.00,
  `sss` decimal(10,2) DEFAULT 0.00,
  `philhealth` decimal(10,2) DEFAULT 0.00,
  `pagbig` decimal(10,2) DEFAULT 0.00,
  `withholding_tax` decimal(10,2) DEFAULT 0.00,
  `finalized` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `ot_hours` decimal(5,2) DEFAULT 0.00,
  `undertime_hours` decimal(5,2) DEFAULT 0.00,
  `ot_pay` decimal(10,2) DEFAULT 0.00,
  `undertime_deduction` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payroll`
--

INSERT INTO `payroll` (`id`, `employee_id`, `pay_period`, `days_present`, `gross_pay`, `net_pay`, `sss`, `philhealth`, `pagbig`, `withholding_tax`, `finalized`, `created_at`, `ot_hours`, `undertime_hours`, `ot_pay`, `undertime_deduction`) VALUES
(51, 1, '2026-06-01 to 2026-06-15', 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1, '2026-06-22 07:53:16', 0.00, 0.00, 0.00, 0.00),
(52, 4, '2026-06-01 to 2026-06-15', 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1, '2026-06-22 07:53:16', 0.00, 0.00, 0.00, 0.00),
(53, 6, '2026-06-01 to 2026-06-15', 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1, '2026-06-22 07:53:16', 0.00, 0.00, 0.00, 0.00),
(54, 7, '2026-06-01 to 2026-06-15', 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1, '2026-06-22 07:53:16', 0.00, 0.00, 0.00, 0.00),
(55, 8, '2026-06-01 to 2026-06-15', 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1, '2026-06-22 07:53:16', 0.00, 0.00, 0.00, 0.00),
(56, 9, '2026-06-01 to 2026-06-15', 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1, '2026-06-22 07:53:16', 0.00, 0.00, 0.00, 0.00),
(57, 10, '2026-06-01 to 2026-06-15', 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1, '2026-06-22 07:53:16', 0.00, 0.00, 0.00, 0.00),
(58, 200245698, '2026-06-01 to 2026-06-15', 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1, '2026-06-22 07:53:16', 0.00, 0.00, 0.00, 0.00),
(59, 200245699, '2026-06-01 to 2026-06-15', 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1, '2026-06-22 07:53:16', 0.00, 0.00, 0.00, 0.00),
(60, 200245700, '2026-06-01 to 2026-06-15', 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1, '2026-06-22 07:53:16', 0.00, 0.00, 0.00, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT NULL,
  `employee_id` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `email` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `position` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `employee_id`, `created_at`, `email`, `name`, `position`) VALUES
(20, 'queenie', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'hr', 'EMP001', '2026-06-16 07:15:24', 'villamin.245698@bacoor.sti.edu.ph', 'Queenie Villamin', 'HR'),
(21, 'andrei', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee', 'EMP002', '2026-06-16 07:15:24', 'illut.353090@bacoor.sti.edu.ph', 'Andrei Keith', 'Lineman'),
(22, 'leo', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'team_leader', 'EMP003', '2026-06-16 07:15:24', 'salvador.348118@bacoor.sti.edu.ph', 'Leo Salvador', 'Driver'),
(23, 'carl', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'coordinator', 'EMP004', '2026-06-16 07:15:24', 'solo.353459@bacoor.sti.edu.ph', 'Carl Solo', 'Coordinator'),
(24, 'kwek', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee', 'EMP005', '2026-06-16 07:15:24', 'kwini420@gmail.com', 'Kwek kwek', 'TL'),
(25, 'emp0009@cklservices.com', '$2y$10$y8Aj55S8OyuFMfEcjZsGL.vviJTjDM64qdkqqIqH4.aPMymHUk/eu', 'employee', 'EMP 0009', '2026-06-17 07:35:26', 'emp0009@cklservices.com', 'ANDREI TANOD', 'LINE MAN'),
(26, 'emp0010@cklservices.com', '$2y$10$0V94dITtGfCHVIHYk7nOcuqzzlJL8rKqBsXidO9xI.kL4XpWlOGT.', 'employee', 'emp0010', '2026-06-17 08:41:45', 'emp0010@cklservices.com', 'NICOYU', 'MAMIMINGER');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `idx_timestamp` (`timestamp`);

--
-- Indexes for table `deployments`
--
ALTER TABLE `deployments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `job_order_id` (`job_order_id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `employee_id` (`employee_id`),
  ADD KEY `idx_current_job_order` (`current_job_order_id`);

--
-- Indexes for table `job_orders`
--
ALTER TABLE `job_orders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_read` (`user_id`,`is_read`);

--
-- Indexes for table `offboarding`
--
ALTER TABLE `offboarding`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `payroll`
--
ALTER TABLE `payroll`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `applications`
--
ALTER TABLE `applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=94;

--
-- AUTO_INCREMENT for table `deployments`
--
ALTER TABLE `deployments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=200245701;

--
-- AUTO_INCREMENT for table `leave_requests`
--
ALTER TABLE `leave_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `offboarding`
--
ALTER TABLE `offboarding`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `payroll`
--
ALTER TABLE `payroll`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `deployments`
--
ALTER TABLE `deployments`
  ADD CONSTRAINT `deployments_ibfk_1` FOREIGN KEY (`job_order_id`) REFERENCES `job_orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `offboarding`
--
ALTER TABLE `offboarding`
  ADD CONSTRAINT `offboarding_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
