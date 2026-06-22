// file-leave.js – uses global API_BASE from utils.js
// Dropdown and user name are handled by auth.js – do NOT duplicate here.

// Store the employee ID in localStorage when it changes
const empIdInput = document.getElementById('employeeId');
if (localStorage.getItem('tl_employee_id')) {
    empIdInput.value = localStorage.getItem('tl_employee_id');
}
empIdInput.addEventListener('change', function() {
    localStorage.setItem('tl_employee_id', this.value.trim());
    loadHistory();
});

async function loadHistory() {
    const empId = empIdInput.value.trim();
    if (!empId) {
        document.getElementById('historyBody').innerHTML = '<tr><td colspan="8">Enter Employee ID to see history.</td></tr>';
        return;
    }
    try {
        const res = await fetch(API_BASE + 'get_leave_requests.php', { credentials: 'include' });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        const myLeaves = data.data.filter(l => l.employee_id == empId);
        const tbody = document.getElementById('historyBody');
        if (myLeaves.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8">No leave requests found for this Employee ID.</td></tr>';
            return;
        }
        let html = '';
        for (let l of myLeaves) {
            let statusClass = `status-${l.status}`;
            let statusText = l.status.charAt(0).toUpperCase() + l.status.slice(1);
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
    } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="8">Error loading history.</td></tr>';
    }
}

document.getElementById('submitLeave').addEventListener('click', async () => {
    const employee_name = document.getElementById('employeeName').value.trim();
    const employee_id = empIdInput.value.trim();
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
            document.getElementById('startDate').value = '';
            document.getElementById('endDate').value = '';
            document.getElementById('reason').value = '';
            loadHistory();
            setTimeout(() => msgDiv.innerHTML = '', 3000);
        } else {
            msgDiv.innerHTML = `<span style="color:red;">Error: ${data.message}</span>`;
        }
    } catch (e) {
        msgDiv.innerHTML = `<span style="color:red;">Request failed: ${e.message}</span>`;
        console.error(e);
    }
});

// Load history on page load if an ID is stored
if (empIdInput.value.trim()) {
    loadHistory();
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}