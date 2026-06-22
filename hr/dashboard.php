<?php
require_once __DIR__ . '/../backend/auth_check.php';

// HR-only access
if ($user_role !== 'hr') {
    header('Location: /hrms/login.html');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HR Dashboard | CKL Construction</title>
    <link rel="icon" type="image/x-icon" href="CKL-1.PNG">
    <link rel="stylesheet" href="../css/hr-dashboard.css">
    <!-- Notification styles (shared across pages) -->
    <link rel="stylesheet" href="../css/notifications.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
</head>
<body>
    <div class="sidebar">
        <div class="sidebar-header"><h2>CKL HRMS</h2><p>Construction Services</p></div>
        <ul class="nav-menu">
    <li class="nav-item active">
        <a href="dashboard.html">
            <i class="bi bi-grid-1x2-fill"></i>
            <span>Dashboard</span>
        </a>
    </li>

    <li class="nav-item">
        <a href="employees.html">
            <i class="bi bi-people-fill"></i>
            <span>Employee Directory</span>
        </a>
    </li>

    <li class="nav-item">
        <a href="biometric-logs.html">
            <i class="bi bi-fingerprint"></i>
            <span>Biometric Logs</span>
        </a>
    </li>

    <li class="nav-item">
        <a href="field-deployments.html">
            <i class="bi bi-truck"></i>
            <span>Field Deployments</span>
        </a>
    </li>

    <li class="nav-item">
        <a href="leave-requests.html">
            <i class="bi bi-calendar-check"></i>
            <span>Leave Requests</span>
        </a>
    </li>

    <li class="nav-item">
        <a href="payroll.html">
            <i class="bi bi-cash-stack"></i>
            <span>Payroll</span>
        </a>
    </li>

    <li class="nav-item">
        <a href="reports.html">
            <i class="bi bi-file-earmark-bar-graph"></i>
            <span>Reports</span>
        </a>
    </li>

    <li class="nav-item">
        <a href="hiring.html">
            <i class="bi bi-person-workspace"></i>
            <span>Hiring</span>
        </a>
    </li>

    <li class="nav-item">
        <a href="register.html">
            <i class="bi bi-person-plus"></i>
            <span>Create New Account</span>
        </a>
    </li>

    <li class="nav-item">
        <a href="offboarding-history.html">
            <i class="bi bi-box-arrow-right"></i>
            <span>Offboarding History</span>
        </a>
    </li>
</ul>
    </div>
    <div class="main-content">
        <div class="top-bar">
            <div class="page-title">Dashboard</div>
            <div class="user-info">
                <!-- ===== NOTIFICATION BELL & DROPDOWN ===== -->
                <div class="notif-container">
    <button class="notif-bell" id="notifBell" onclick="toggleNotifDropdown();">
        <i class="bi bi-bell-fill"></i>
        <span class="notif-badge" id="notifBadge">0</span>
    </button>

    <div class="notif-dropdown" id="notifDropdown">
        <div id="notifList"></div>
    </div>
</div>

                <!-- Original user dropdown (unchanged) -->
                <div class="dropdown">
                    <button class="dropbtn" id="dropbtn">
                        <span id="userNameDisplay">HR Administrator</span> <span style="font-size:0.8rem;">▼</span>
                    </button>
                    <div id="dropdownMenu" class="dropdown-content">
                        <a href="/hrms/change-password.html">Change Password</a>
                        <a href="/hrms/backend/api/logout.php">Logout</a>
                    </div>
                </div>
            </div>
        </div>
        <div class="container">
            <div class="metrics">
                <div class="card" id="totalEmployeesCard"><h3>Total Employees</h3><div class="number" id="totalEmployees">--</div></div>
                <div class="card" id="presentTodayCard"><h3>Present Today</h3><div class="number" id="presentToday">--</div></div>
                <div class="card" id="onLeaveCard"><h3>On Leave</h3><div class="number" id="onLeaveCount">--</div></div>
                <div class="card" id="activeDeploymentsCard"><h3>Active Deployments</h3><div class="number" id="activeDeployments">0</div></div>
            </div>
            <div class="dashboard-row">
                <div class="panel">
                    <h2>Resource Pool – Available Employees</h2>
                    <div id="availableEmployeesList"></div>
                    <a href="employees.html" class="view-all">View All →</a>
                </div>
                <div class="panel">
                    <h2>Leave Requests</h2>
                    <div id="leaveRequestsContainer"></div>
                    <a href="leave-requests.html" class="view-all">View All →</a>
                </div>
            </div>
        </div>
    </div>

    <!-- Assign Modal (unchanged) -->
    <div id="assignModal" class="modal">
        <div class="modal-content">
            <h3>Assign to Team</h3>
            <p id="assignEmployeeName"></p>
            <select id="teamSelect">
                <option value="Alpha">Team Alpha</option>
                <option value="Bravo">Team Bravo</option>
                <option value="Charlie">Team Charlie</option>
                <option value="Delta">Team Delta</option>
                <option value="Echo">Team Echo</option>
                <option value="Foxtrot">Team Foxtrot</option>
                <option value="Golf">Team Golf</option>
            </select>
            <div class="modal-buttons">
                <button class="cancel-btn" onclick="closeAssignModal()">Cancel</button>
                <button class="confirm-btn" id="confirmAssignBtn">Assign</button>
            </div>
        </div>
    </div>

    <!-- ===== SCRIPTS – ORDER MATTERS! ===== -->
    <script src="../js/utils.js"></script>
    <script src="../js/auth.js"></script>
    <script src="../js/notifications.js"></script>
    <!-- Dashboard-specific script (loads metrics, etc.) -->
    <script src="../js/hr-dashboard.js"></script>
</body>
</html>