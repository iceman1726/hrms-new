// employee-leave-requests.js – uses global API_BASE from utils.js
// Dropdown and user name are handled by auth.js – do NOT duplicate here.

const CACHE_KEY = 'leave_history_cache';
const ID_KEY = 'employee_id';

// Get employee ID from localStorage
const empId = localStorage.getItem('employee_id');

// Pre-fill form fields with employee data
if (empId) {
    document.getElementById('employeeId').value = empId;
}

function getCachedLeaves() {
    try {
        return JSON.parse(localStorage.getItem(CACHE_KEY)) || [];
    } catch { return []; }
}

function setCachedLeaves(leaves) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(leaves));
}

function addLeaveToCache(newLeave) {
    const leaves = getCachedLeaves();
    const exists = leaves.some(l => 
        l.employee_id === newLeave.employee_id &&
        l.start_date === newLeave.start_date &&
        l.end_date === newLeave.end_date &&
        l.type === newLeave.type
    );
    if (!exists) {
        leaves.push(newLeave);
        setCachedLeaves(leaves);
    }
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    str = String(str);
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ─── Render history ──────────────────────────────────────────────
function renderHistory(leaves) {
    const tbody = document.getElementById('historyBody');
    
    if (!empId) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-message">No employee ID found.</td></tr>';
        return;
    }
    
    const myLeaves = leaves.filter(l => String(l.employee_id) === String(empId));
    if (myLeaves.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-message">No leave requests found.</td></tr>';
        return;
    }
    let html = '';
    for (let l of myLeaves) {
        const statusClass = `status-${l.status}`;
        const statusText = l.status.charAt(0).toUpperCase() + l.status.slice(1);
        html += `<tr>
            <td>${escapeHtml(l.employee_name || '-')}</td>
            <td>${escapeHtml(l.employee_id)}</td>
            <td>${escapeHtml(l.position || '-')}</td>
            <td>${escapeHtml(l.type)}</td>
            <td>${escapeHtml(l.start_date)}</td>
            <td>${escapeHtml(l.end_date)}</td>
            <td>${escapeHtml(l.reason || '-')}</td>
            <td><span class="${statusClass}">${statusText}</span></td>
        </tr>`;
    }
    tbody.innerHTML = html;
}

// ─── Load history ─────────────────────────────────────────────────
async function loadHistory() {
    const tbody = document.getElementById('historyBody');

    if (!empId) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-message">No employee ID found.</td></tr>';
        return;
    }

    try {
        const res = await fetch(API_BASE + 'get_leave_requests.php', { credentials: 'include' });
        const data = await res.json();

        if (data.success && Array.isArray(data.data)) {
            setCachedLeaves(data.data);
            renderHistory(data.data);
            return;
        } else {
            throw new Error(data.message || 'Server returned invalid response');
        }
    } catch (err) {
        console.warn('Failed to fetch from server, using cache:', err);
        const cached = getCachedLeaves();
        if (cached.length > 0) {
            renderHistory(cached);
            tbody.innerHTML += `<tr><td colspan="8" style="color:#e67e22; font-size:0.8rem; text-align:center;">
                Using cached data – server may be unavailable.
            </td></tr>`;
        } else {
            tbody.innerHTML = '<tr><td colspan="8" class="empty-message">Unable to load history. Please try again later.</td></tr>';
        }
    }
}

// ─── Clear ALL form fields ────────────────────────────────────────
function clearAllFields() {
    document.getElementById('employeeName').value = '';
    document.getElementById('employeeId').value = empId || '';
    document.getElementById('position').value = '';
    document.getElementById('leaveType').value = 'Sick Leave';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('reason').value = '';
}

// ─── Submit leave ──────────────────────────────────────────────────
document.getElementById('submitLeave').addEventListener('click', async () => {
    const employee_name = document.getElementById('employeeName').value.trim();
    const employee_id = document.getElementById('employeeId').value.trim();
    const position = document.getElementById('position').value.trim();
    const type = document.getElementById('leaveType').value;
    const start_date = document.getElementById('startDate').value;
    const end_date = document.getElementById('endDate').value;
    const reason = document.getElementById('reason').value.trim();
    const msgDiv = document.getElementById('submitMessage');

    if (!employee_name || !employee_id || !position || !type || !start_date || !end_date) {
        msgDiv.innerHTML = '<span style="color:red;">Please fill all fields.</span>';
        return;
    }

    localStorage.setItem(ID_KEY, employee_id);

    msgDiv.innerHTML = 'Submitting...';
    try {
        const res = await fetch(API_BASE + 'submit_leave.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ employee_name, employee_id, position, type, start_date, end_date, reason })
        });
        const data = await res.json();

        if (data.success) {
            msgDiv.innerHTML = '<span style="color:green;">Leave request submitted. HR will review.</span>';
            
            const newLeave = {
                employee_name,
                employee_id,
                position,
                type,
                start_date,
                end_date,
                reason,
                status: 'pending'
            };
            addLeaveToCache(newLeave);

            clearAllFields();
            await loadHistory();
            setTimeout(() => msgDiv.innerHTML = '', 3000);
        } else {
            msgDiv.innerHTML = `<span style="color:red;">Error: ${data.message}</span>`;
        }
    } catch (e) {
        msgDiv.innerHTML = `<span style="color:red;">Request failed: ${e.message}</span>`;
        console.error(e);
    }
});

document.getElementById('employeeId').addEventListener('blur', function() {
    if (this.value.trim()) {
        localStorage.setItem(ID_KEY, this.value.trim());
        loadHistory();
    }
});

// ─── Load history on page load ──────────────────────────────────
window.addEventListener('load', function() {
    if (empId) {
        document.getElementById('employeeId').value = empId;
        loadHistory();
    }
});