// hr-dashboard.js – dashboard-specific logic only
// API_BASE is already defined globally in utils.js – do NOT redeclare it.

// Set user name (optional – auth.js already does this, but kept for safety)
const userName = localStorage.getItem('user_name');
if (document.getElementById('userNameDisplay')) {
    document.getElementById('userNameDisplay').innerText = userName || 'HR Administrator';
}

// Fetch employees from API
async function fetchEmployees() {
    const res = await fetch(API_BASE + 'get_employees.php', { credentials: 'include' });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
}

// Render dashboard metrics and lists
async function renderDashboard() {
    try {
        const employees = await fetchEmployees();
        const total = employees.length;
        const onLeave = employees.filter(e => e.status === 'On Leave').length;
        document.getElementById('totalEmployees').innerText = total;
        document.getElementById('onLeaveCount').innerText = onLeave;
        document.getElementById('presentToday').innerText = '?';

        // Available employees (not assigned to a team)
        const available = employees.filter(emp => !emp.current_team);
        const availContainer = document.getElementById('availableEmployeesList');
        if (available.length === 0) {
            availContainer.innerHTML = '<div class="empty-message">No available employees. All have been assigned.</div>';
        } else {
            let html = '';
            available.forEach(emp => {
                html += `<div class="available-employee-item">
                            <span>${emp.name}</span>
                            <button class="btn-assign" data-id="${emp.id}" data-name="${emp.name}">Assign to Team</button>
                        </div>`;
            });
            availContainer.innerHTML = html;
        }

        // Leave requests (pending)
        const leaveRes = await fetch(API_BASE + 'get_leave_requests.php', { credentials: 'include' });
        const leaveData = await leaveRes.json();
        if (leaveData.success) {
            const pendingLeaves = leaveData.data.filter(l => l.status === 'pending');
            const leaveContainer = document.getElementById('leaveRequestsContainer');
            if (pendingLeaves.length === 0) {
                leaveContainer.innerHTML = '<div class="empty-message">No pending leave requests.</div>';
            } else {
                let html = '';
                pendingLeaves.forEach(req => {
                    html += `<div class="leave-item">
                                <div><strong>${req.employee_name}</strong><br>${req.type} (${req.start_date} to ${req.end_date})</div>
                                <button class="btn-approve" data-id="${req.id}">Review</button>
                            </div>`;
                });
                leaveContainer.innerHTML = html;
            }
        }
    } catch (err) {
        console.error(err);
    }
}

// Modal handling
let currentEmployeeId = null;
let currentEmployeeName = null;

function openAssignModal(empId, empName) {
    currentEmployeeId = empId;
    currentEmployeeName = empName;
    document.getElementById('assignEmployeeName').innerHTML = `<strong>${empName}</strong>`;
    document.getElementById('assignModal').style.display = 'flex';
}

function closeAssignModal() {
    document.getElementById('assignModal').style.display = 'none';
    currentEmployeeId = null;
}

async function assignEmployeeToTeam(empId, team) {
    const res = await fetch(API_BASE + 'assign_employee.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ employee_id: empId, team: team })
    });
    return await res.json();
}

// Event: confirm assign button
document.getElementById('confirmAssignBtn').addEventListener('click', async () => {
    if (!currentEmployeeId) return;
    const selectedTeam = document.getElementById('teamSelect').value;
    const result = await assignEmployeeToTeam(currentEmployeeId, selectedTeam);
    if (result.success) {
        alert(`${currentEmployeeName} assigned to Team ${selectedTeam}`);
        renderDashboard();
        closeAssignModal();
    } else {
        alert('Error: ' + result.message);
    }
});

// Event: "Assign to Team" button clicks (delegation)
document.getElementById('availableEmployeesList').addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-assign')) {
        const empId = e.target.getAttribute('data-id');
        const empName = e.target.getAttribute('data-name');
        openAssignModal(empId, empName);
    }
});

// Event: "Review" button on leave requests (redirect)
document.getElementById('leaveRequestsContainer').addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-approve')) {
        window.location.href = 'leave-requests.html';
    }
});

// Card click navigation
document.getElementById('totalEmployeesCard').addEventListener('click', () => {
    window.location.href = 'employees.html';
});
document.getElementById('onLeaveCard').addEventListener('click', () => {
    window.location.href = 'employees.html?status=On%20Leave';
});
document.getElementById('presentTodayCard').addEventListener('click', () => {
    window.location.href = 'biometric-logs.html';
});
document.getElementById('activeDeploymentsCard').addEventListener('click', () => {
    window.location.href = 'field-deployments.html';
});

// Initial render
renderDashboard();