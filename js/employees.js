// employees.js – Employee Directory functionality
// API_BASE is globally available from utils.js
// Dropdown and user name are handled by auth.js – do NOT duplicate here.

// Fetch employees from API
async function fetchEmployees() {
    const res = await fetch(API_BASE + 'get_employees.php', { credentials: 'include' });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
}

// Render the employee table
async function renderEmployees() {
    const tbody = document.getElementById('employeeTableBody');
    try {
        const employees = await fetchEmployees();
        if (employees.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No employees found</td></tr>';
            return;
        }
        let html = '';
        for (const emp of employees) {
            html += '<tr>';
            html += '<td>' + emp.id + '</td>';
            html += '<td>' + emp.name + '</td>';
            html += '<td>' + emp.position + '</td>';
            html += '<td>' + emp.department + '</td>';
            html += '<td>₱' + (emp.daily_rate || 0) + '</td>';
            html += '<td>' + emp.status + '</td>';
            html += '<td>';
            html += '<button class="btn-edit" data-id="' + emp.id + '" data-name="' + emp.name + '" data-position="' + emp.position + '" data-department="' + emp.department + '" data-daily="' + (emp.daily_rate || 0) + '" data-status="' + emp.status + '">Edit</button>';
            if (emp.status !== 'Inactive') {
                html += '<button class="btn-offboard" data-id="' + emp.id + '" data-name="' + emp.name + '">Offboard</button>';
            }
            html += '<button class="btn-delete" data-id="' + emp.id + '">Delete</button>';
            html += '</td></tr>';
        }
        tbody.innerHTML = html;
        attachEvents();
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Error: ' + err.message + '</td></tr>';
    }
}

// Attach event listeners to dynamic buttons (edit, delete, offboard)
function attachEvents() {
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            openEditModal(
                btn.getAttribute('data-id'),
                btn.getAttribute('data-name'),
                btn.getAttribute('data-position'),
                btn.getAttribute('data-department'),
                btn.getAttribute('data-daily'),
                btn.getAttribute('data-status')
            );
        });
    });
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm('Delete this employee?')) {
                const id = btn.getAttribute('data-id');
                const res = await fetch(API_BASE + 'delete_employee.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ id })
                });
                const data = await res.json();
                if (data.success) {
                    alert('Employee deleted');
                    renderEmployees();
                } else {
                    alert('Error: ' + data.message);
                }
            }
        });
    });
    document.querySelectorAll('.btn-offboard').forEach(btn => {
        btn.addEventListener('click', () => {
            openOffboardModal(btn.getAttribute('data-id'), btn.getAttribute('data-name'));
        });
    });
}

// ---- Add Employee Modal ----
function openAddModal() {
    document.getElementById('addModal').style.display = 'flex';
}
function closeAddModal() {
    document.getElementById('addModal').style.display = 'none';
    document.getElementById('addName').value = '';
    document.getElementById('addPosition').value = '';
    document.getElementById('addDepartment').value = '';
    document.getElementById('addDailyRate').value = '';
    document.getElementById('addStatus').value = 'Active';
}
document.getElementById('saveAddBtn').addEventListener('click', async () => {
    const name = document.getElementById('addName').value;
    const position = document.getElementById('addPosition').value;
    const department = document.getElementById('addDepartment').value;
    const dailyRate = document.getElementById('addDailyRate').value;
    const status = document.getElementById('addStatus').value;
    if (!name || !position || !department) {
        alert('Please fill in all required fields');
        return;
    }
    const res = await fetch(API_BASE + 'add_employee.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, position, department, daily_rate: dailyRate, status })
    });
    const data = await res.json();
    if (data.success) {
        alert('Employee added successfully');
        closeAddModal();
        renderEmployees();
    } else {
        alert('Error: ' + data.message);
    }
});

// ---- Edit Employee Modal ----
function openEditModal(id, name, position, department, dailyRate, status) {
    document.getElementById('editId').value = id;
    document.getElementById('editName').value = name;
    document.getElementById('editPosition').value = position;
    document.getElementById('editDepartment').value = department;
    document.getElementById('editDailyRate').value = dailyRate;
    document.getElementById('editStatus').value = status;
    document.getElementById('editModal').style.display = 'flex';
}
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}
document.getElementById('saveEditBtn').addEventListener('click', async () => {
    const id = document.getElementById('editId').value;
    const name = document.getElementById('editName').value;
    const position = document.getElementById('editPosition').value;
    const department = document.getElementById('editDepartment').value;
    const dailyRate = document.getElementById('editDailyRate').value;
    const status = document.getElementById('editStatus').value;
    const res = await fetch(API_BASE + 'update_employee.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, name, position, department, daily_rate: dailyRate, status })
    });
    const data = await res.json();
    if (data.success) {
        alert('Employee updated successfully');
        closeEditModal();
        renderEmployees();
    } else {
        alert('Error: ' + data.message);
    }
});

// ---- Offboard Modal ----
let currentOffboardEmployeeId = null;
function openOffboardModal(id, name) {
    currentOffboardEmployeeId = id;
    document.getElementById('offboardId').value = id;
    document.getElementById('offboardName').innerHTML = '<strong>' + name + '</strong>';
    document.getElementById('offboardDate').value = '';
    document.getElementById('offboardReason').value = 'Resigned';
    document.getElementById('offboardRemarks').value = '';
    document.getElementById('offboardModal').style.display = 'flex';
}
function closeOffboardModal() {
    document.getElementById('offboardModal').style.display = 'none';
    currentOffboardEmployeeId = null;
}
document.getElementById('saveOffboardBtn').addEventListener('click', async () => {
    const id = currentOffboardEmployeeId;
    const offboardDate = document.getElementById('offboardDate').value;
    const reason = document.getElementById('offboardReason').value;
    const remarks = document.getElementById('offboardRemarks').value;
    if (!offboardDate) {
        alert('Please enter offboarding date');
        return;
    }
    await fetch(API_BASE + 'add_offboarding.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ employee_id: id, offboard_date: offboardDate, reason: reason, remarks: remarks })
    });
    const res = await fetch(API_BASE + 'update_employee.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, status: 'Inactive' })
    });
    const data = await res.json();
    if (data.success) {
        alert('Employee offboarded successfully');
        closeOffboardModal();
        renderEmployees();
    } else {
        alert('Error: ' + data.message);
    }
});

// ---- Search Filter ----
document.getElementById('searchInput').addEventListener('input', async function(e) {
    const term = e.target.value.toLowerCase();
    const employees = await fetchEmployees();
    const filtered = employees.filter(emp => emp.name.toLowerCase().includes(term) || emp.id.toString().includes(term));
    const tbody = document.getElementById('employeeTableBody');
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No matching employees</td></tr>';
        return;
    }
    let html = '';
    for (const emp of filtered) {
        html += '<tr>';
        html += '<td>' + emp.id + '</td>';
        html += '<td>' + emp.name + '</td>';
        html += '<td>' + emp.position + '</td>';
        html += '<td>' + emp.department + '</td>';
        html += '<td>₱' + (emp.daily_rate || 0) + '</td>';
        html += '<td>' + emp.status + '</td>';
        html += '<td>';
        html += '<button class="btn-edit" data-id="' + emp.id + '" data-name="' + emp.name + '" data-position="' + emp.position + '" data-department="' + emp.department + '" data-daily="' + (emp.daily_rate || 0) + '" data-status="' + emp.status + '">Edit</button>';
        if (emp.status !== 'Inactive') {
            html += '<button class="btn-offboard" data-id="' + emp.id + '" data-name="' + emp.name + '">Offboard</button>';
        }
        html += '<button class="btn-delete" data-id="' + emp.id + '">Delete</button>';
        html += '</td></tr>';
    }
    tbody.innerHTML = html;
    attachEvents();
});

// ---- "Add Employee" button (only attach if button exists) ----
const addBtn = document.getElementById('addEmployeeBtn');
if (addBtn) {
    addBtn.addEventListener('click', openAddModal);
}

// ---- Initial render ----
renderEmployees();