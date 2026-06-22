<?php
require_once __DIR__ . '/../backend/auth_check.php';

// Team Leader-only access
if ($user_role !== 'team_leader') {
    header('Location: /hrms/login.html');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TL Dashboard | CKL Construction</title>
    <link rel="icon" type="image/x-icon" href="../CKL-1.PNG">
    <link rel="stylesheet" href="../css/tl-dashboard.css">
    <link rel="stylesheet" href="../css/notifications.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
</head>
<body>
    <div class="sidebar">
        <div class="sidebar-header"><h2>CKL HRMS</h2><p>Construction Services</p></div>
        <ul class="nav-menu">

    <li class="nav-item active">
        <a href="tl-dashboard.php">
            <i class="bi bi-grid-1x2-fill"></i>
            <span>Dashboard</span>
        </a>
    </li>

    <li class="nav-item">
        <a href="attendance-history.html">
            <i class="bi bi-calendar-check"></i>
            <span>My Attendance</span>
        </a>
    </li>

    <li class="nav-item">
        <a href="for-validation.html">
            <i class="bi bi-clipboard-check"></i>
            <span>For Validation</span>
        </a>
    </li>

    <li class="nav-item">
        <a href="deployment-history.html">
            <i class="bi bi-truck"></i>
            <span>Past Deployments</span>
        </a>
    </li>

    <li class="nav-item">
        <a href="file-leave.html">
            <i class="bi bi-calendar-plus"></i>
            <span>File a Leave</span>
        </a>
    </li>

    <li class="nav-item">
        <a href="payslips.html">
            <i class="bi bi-cash-stack"></i>
            <span>My Payslips</span>
        </a>
    </li>
</ul>
    </div>
    <div class="main-content">
        <div class="top-bar">
            <div class="page-title">Team Leader Dashboard</div>
            <div class="user-info">
                <!-- Notification Bell -->
                <div class="notif-container">
    <button class="notif-bell" id="notifBell" onclick="toggleNotifDropdown();">
        <i class="bi bi-bell-fill"></i>
        <span class="notif-badge" id="notifBadge">0</span>
    </button>

    <div class="notif-dropdown" id="notifDropdown">
        <div id="notifList"></div>
    </div>
</div>

                <!-- User dropdown -->
                <div class="dropdown">
                    <button class="dropbtn" id="dropbtn">
                        <span id="userNameDisplay">Team Leader</span> <span style="font-size:0.8rem;">▼</span>
                    </button>
                    <div id="dropdownMenu" class="dropdown-content">
                        <a href="../change-password.html">Change Password</a>
                        <a href="../backend/api/logout.php" onclick="event.preventDefault(); handleLogout();">Logout</a>
                    </div>
                </div>
            </div>
        </div>
        <div class="container">
            <!-- Team Members Summary -->
            <div class="panel">
                <h2>My Team (Alpha) – Attendance Summary (Last 30 days)
                    <button class="view-more" id="viewMoreAttendanceBtn">View more</button>
                </h2>
                <div id="teamMembersList" class="team-grid"></div>
            </div>
            <!-- Active Deployments (Needs Validation) -->
            <div class="panel">
                <h2>Active Deployments (Needs Validation)
                    <button class="view-more" id="viewAllDeploymentsBtn">View all</button>
                </h2>
                <div id="deploymentsList"></div>
            </div>
            <!-- Pending Leave Requests (read-only) -->
            <div class="panel">
                <h2>Pending Leave Requests (Team Members)</h2>
                <div id="pendingLeaves"></div>
                <div class="info-note">Leave approval is handled by HR. Team Leaders can only view pending requests.</div>
            </div>
        </div>
    </div>

    <!-- Modal for detailed attendance view -->
    <div id="attendanceModal" class="modal">
        <div class="modal-content">
            <h3>Detailed Attendance Report</h3>
            <div id="attendanceDetail"></div>
            <div class="modal-buttons">
                <button class="confirm-btn" onclick="closeAttendanceModal()">Close</button>
            </div>
        </div>
    </div>

    <script src="../js/utils.js"></script>
    <script src="../js/auth.js"></script>
    <script src="../js/notifications.js"></script>
    <script src="../js/tl-dashboard.js"></script>
</body>
</html>