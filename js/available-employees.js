// Available Employees – uses global API_BASE from utils.js
let currentEmployeeId = null;
let currentEmployeeName = null;

async function fetchAvailableEmployees() {
    const tbody = document.getElementById('employeeTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="4" class="empty-message">Loading...</td></tr>';

    try {
        const res = await fetch(API_BASE + 'get_available_employees.php', { credentials: 'include' });
        const data = await res.json();

        if (!data.success) throw new Error(data.message || 'Failed to fetch');

        const employees = data.data || [];

        if (employees.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-message">No available employees. Either everyone is assigned to a job, or no one has time-in yet.</td></tr>';
            return;
        }

        let html = '';
        for (let emp of employees) {
            html += `<tr>
                <td>${escapeHtml(emp.id)}</td>
                <td><strong>${escapeHtml(emp.name)}</strong></td>
                <td><span class="status-badge status-available">Available (On Duty)</span></td>
                <td><button class="btn-assign" data-id="${emp.id}" data-name="${escapeHtml(emp.name)}">Assign to Job</button></td>
            </tr>`;
        }
        tbody.innerHTML = html;

        document.querySelectorAll('.btn-assign').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.dataset.id;
                const name = this.dataset.name;
                openAssignModal(id, name);
            });
        });

    } catch (error) {
        console.error('Error loading available employees:', error);
        tbody.innerHTML = `<tr><td colspan="4" class="empty-message" style="color:red;">Error: ${error.message}</td></tr>`;
    }
}

async function fetchActiveJobOrders() {
    try {
        const res = await fetch(API_BASE + 'get_job_orders.php', { credentials: 'include' });
        const data = await res.json();
        const select = document.getElementById('jobOrderSelect');
        if (!select) return;

        if (!data.success) {
            select.innerHTML = '<option value="">Error loading jobs</option>';
            return;
        }

        const activeJobs = data.data.filter(job => 
            job.status === 'Pending' || job.status === 'Dispatched' || job.status === 'In Progress'
        );

        if (activeJobs.length === 0) {
            select.innerHTML = '<option value="">No active job orders available</option>';
            return;
        }

        let html = '';
        for (let job of activeJobs) {
            const label = job.ticket_no + ' - ' + (job.project_name || 'No project') + ' (' + job.status + ')';
            html += `<option value="${job.id}">${escapeHtml(label)}</option>`;
        }
        select.innerHTML = html;

    } catch (e) {
        console.error('Error fetching job orders:', e);
        document.getElementById('jobOrderSelect').innerHTML = '<option value="">Error loading jobs</option>';
    }
}

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
            alert(currentEmployeeName + ' assigned successfully.');
            closeAssignModal();
            fetchAvailableEmployees();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (e) {
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