<?php
require_once __DIR__ . '/../backend/auth_check.php';

// Coordinator-only access
if ($user_role !== 'coordinator') {
    header('Location: /hrms/login.html');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Coordinator Dashboard | CKL Construction</title>
    <link rel="icon" type="image/x-icon" href="../CKL-1.PNG">
    <link rel="stylesheet" href="../css/coordinator-dashboard.css">
    <link rel="stylesheet" href="../css/notifications.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
</head>
<body>
    <div class="sidebar">
        <div class="sidebar-header"><h2>CKL HRMS</h2><p>Construction Services</p></div>
        <ul class="nav-menu">

        <li class="nav-item active">
            <a href="dashboard.php">
                <i class="bi bi-grid-1x2-fill"></i>
                <span>Dashboard</span>
            </a>
        </li>

        <li class="nav-item">
            <a href="available-employees.html">
                <i class="bi bi-people-fill"></i>
                <span>Available Employees</span>
            </a>
        </li>

        <li class="nav-item">
            <a href="job-orders.html">
                <i class="bi bi-clipboard-data"></i>
                <span>Job Orders</span>
            </a>
        </li>

        <li class="nav-item">
            <a href="teams.html">
                <i class="bi bi-diagram-3-fill"></i>
                <span>Teams</span>
            </a>
        </li>

        <li class="nav-item">
            <a href="active-deployments.html">
                <i class="bi bi-truck"></i>
                <span>Active Deployments</span>
            </a>
        </li>

        <li class="nav-item">
            <a href="completed-job-orders.html">
                <i class="bi bi-check2-square"></i>
                <span>Completed Job Orders</span>
            </a>
        </li>

    </ul>
    </div>
    <div class="main-content">
        <div class="top-bar">
            <div class="page-title">Coordinator Dashboard</div>
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
                        <span id="userNameDisplay">Coordinator</span> <span style="font-size:0.8rem;">▼</span>
                    </button>
                    <div id="dropdownMenu" class="dropdown-content">
                        <a href="../change-password.html">Change Password</a>
                        <a href="../backend/api/logout.php">Logout</a>
                    </div>
                </div>
            </div>
        </div>
        <div class="container">
            <div class="two-columns">
                <div class="column">
                    <div class="panel">
                        <h2>Available Employees <span style="font-size:0.8rem; font-weight:normal; color:#5a6e7c;">(on duty, not assigned)</span></h2>
                        <div id="availableEmployeesList"></div>
                        <a href="available-employees.html" class="view-all">View All →</a>
                    </div>
                </div>
                <div class="column">
                    <div class="panel">
                        <h2>Teams & Assigned Members</h2>
                        <div id="teamsList"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Assign Modal -->
    <div id="assignModal" class="modal">
        <div class="modal-content">
            <h3>Assign to Job Order</h3>
            <p id="assignEmployeeName"></p>
            <div class="form-group">
                <label for="jobOrderSelect">Select Job Order:</label>
                <select id="jobOrderSelect">
                    <option value="">Loading job orders...</option>
                </select>
            </div>
            <div class="modal-buttons">
                <button class="cancel-btn" id="cancelAssignBtn">Cancel</button>
                <button class="confirm-btn" id="confirmAssignBtn">Assign</button>
            </div>
        </div>
    </div>

    <script src="../js/utils.js"></script>
    <script src="../js/auth.js"></script>
    <script src="../js/notifications.js"></script>
    <script src="../js/coordinator-dashboard.js"></script>
</body>
</html>