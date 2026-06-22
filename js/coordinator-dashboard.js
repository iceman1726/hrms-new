// Coordinator Dashboard – uses global API_BASE from utils.js
let allAvailableEmployees = [];
let allEmployeesFull = [];
let activeJobOrders = [];
const teamNames = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf'];

// ---- FETCH AVAILABLE EMPLOYEES ----
async function fetchAvailableEmployees() {
    try {
        const res = await fetch(API_BASE + 'get_available_employees.php', { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
            allAvailableEmployees = data.data;
            renderAvailable();
        } else {
            console.error('Failed to fetch available employees:', data.message);
            allAvailableEmployees = [];
            renderAvailable();
        }
    } catch(e) {
        console.error('Error fetching available employees:', e);
        allAvailableEmployees = [];
        renderAvailable();
    }
}

async function fetchAllEmployees() {
    try {
        const res = await fetch(API_BASE + 'get_employees.php', { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
            allEmployeesFull = data.data;
            renderTeams();
        }
    } catch(e) {
        console.error('Error fetching all employees:', e);
    }
}

async function fetchActiveJobOrders() {
    try {
        const res = await fetch(API_BASE + 'get_job_orders.php', { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
            activeJobOrders = data.data.filter(job => job.status !== 'Completed');
            populateJobOrderDropdown();
        }
    } catch(e) {
        console.error('Error fetching job orders:', e);
    }
}

function populateJobOrderDropdown() {
    const select = document.getElementById('jobOrderSelect');
    if (!select) return;
    if (activeJobOrders.length === 0) {
        select.innerHTML = '<option value="">No active job orders</option>';
        return;
    }
    let html = '';
    for (let job of activeJobOrders) {
        const label = job.ticket_no + ' - ' + (job.project_name || 'No project') + ' (' + job.status + ')';
        html += `<option value="${job.id}">${escapeHtml(label)}</option>`;
    }
    select.innerHTML = html;
}

function renderAvailable() {
    const container = document.getElementById('availableEmployeesList');
    if (!container) return;

    if (allAvailableEmployees.length === 0) {
        container.innerHTML = '<div class="empty-message">No available employees. All on-duty employees are either assigned to a job or have timed out.</div>';
        return;
    }

    let html = '';
    for (let emp of allAvailableEmployees) {
        html += `
            <div class="available-employee-item">
                <div><span class="employee-name">${escapeHtml(emp.name)}</span></div>
                <button class="btn-assign" data-id="${emp.id}" data-name="${escapeHtml(emp.name)}">Assign to Job</button>
            </div>
        `;
    }
    container.innerHTML = html;

    document.querySelectorAll('.btn-assign').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');
            openAssignModal(id, name);
        });
    });
}

function renderTeams() {
    const container = document.getElementById('teamsList');
    if (!container) return;

    let teamMembers = {};
    for (let team of teamNames) { teamMembers[team] = []; }
    for (let emp of allEmployeesFull) {
        if (emp.current_team && teamMembers[emp.current_team]) {
            teamMembers[emp.current_team].push(emp.name);
        }
    }

    let html = '';
    for (let team of teamNames) {
        const members = teamMembers[team];
        const memberNames = members.length > 0 ? members.join(', ') : 'No members';
        html += `
            <div class="team-card">
                <div class="team-header">
                    <span>Team ${team}</span>
                    <span>${members.length} members</span>
                </div>
                <div class="team-members-list">${escapeHtml(memberNames)}</div>
            </div>
        `;
    }
    container.innerHTML = html;
}

let currentEmployeeId = null;
let currentEmployeeName = null;

function openAssignModal(id, name) {
    currentEmployeeId = id;
    currentEmployeeName = name;
    fetchActiveJobOrders().then(() => {
        document.getElementById('assignEmployeeName').innerHTML = '<strong>' + escapeHtml(name) + '</strong>';
        document.getElementById('assignModal').style.display = 'flex';
    });
}

function closeAssignModal() {
    document.getElementById('assignModal').style.display = 'none';
    currentEmployeeId = null;
    currentEmployeeName = null;
}

async function assignEmployeeToJobOrder(empId, jobOrderId) {
    const res = await fetch(API_BASE + 'assign_employee.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ employee_id: empId, job_order_id: jobOrderId })
    });
    return await res.json();
}

document.getElementById('confirmAssignBtn').addEventListener('click', async function() {
    if (!currentEmployeeId) return;
    const jobOrderId = document.getElementById('jobOrderSelect').value;
    if (!jobOrderId) {
        alert('Please select a job order.');
        return;
    }

    try {
        const result = await assignEmployeeToJobOrder(currentEmployeeId, jobOrderId);
        if (result.success) {
            alert(currentEmployeeName + ' assigned to job order.');
            closeAssignModal();
            fetchAvailableEmployees();
        } else {
            alert('Error: ' + result.message);
        }
    } catch(e) {
        alert('Request failed: ' + e.message);
    }
});

document.getElementById('cancelAssignBtn').addEventListener('click', closeAssignModal);
window.onclick = function(e) {
    if (e.target === document.getElementById('assignModal')) closeAssignModal();
};

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        if (m === '"') return '&quot;';
        return m;
    });
}

fetchAvailableEmployees();
fetchAllEmployees();