// Biometric Logs – uses global API_BASE from utils.js
// Dropdown toggle is handled by auth.js – do NOT duplicate it here.

// Set user name
const userName = localStorage.getItem('user_name');
if (document.getElementById('userNameDisplay')) {
    document.getElementById('userNameDisplay').innerText = userName || 'HR Administrator';
}

// ---- NOTIFICATION BELL: Load notifications (does not affect dropdown) ----
document.addEventListener('DOMContentLoaded', function() {
    if (typeof loadNotifications === 'function') {
        loadNotifications();
        setInterval(loadNotifications, 30000);
    }
});

async function fetchAttendance() {
    const res = await fetch(API_BASE + 'get_attendance.php', { credentials: 'include' });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
}

async function adjustAttendance(id, newTimestamp, reason) {
    const res = await fetch(API_BASE + 'adjust_attendance.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, new_timestamp: newTimestamp, reason })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
}

function getStatusFromTime(timestamp) {
    const timePart = timestamp.split(' ')[1];
    if (!timePart) return 'Unknown';
    const [hours, minutes] = timePart.split(':');
    const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
    return totalMinutes > 490 ? 'Late' : 'On time';
}

async function renderAttendance() {
    const tbody = document.getElementById('tableBody');
    try {
        let records = await fetchAttendance();
        const dateFilter = document.getElementById('dateFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        if (dateFilter) {
            records = records.filter(r => {
                const datePart = r.timestamp.split(' ')[0];
                return datePart === dateFilter;
            });
        }
        if (statusFilter !== 'all') {
            records = records.filter(r => getStatusFromTime(r.timestamp) === statusFilter);
        }
        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No attendance records found</td></tr>';
            return;
        }
        let html = '';
        for (const rec of records) {
            const status = getStatusFromTime(rec.timestamp);
            const statusClass = status === 'On time' ? 'status-on-time' : 'status-late';
            html += '<tr id="row-' + rec.id + '">';
            html += '<td><strong>' + rec.employee_name + '</strong></td>';
            html += '<td>' + rec.timestamp + '</td>';
            html += '<td>' + rec.method + '</td>';
            html += '<td><span class="status-badge ' + statusClass + '">' + status + '</span></td>';
            html += '<td><button class="btn-edit" data-id="' + rec.id + '" data-ts="' + rec.timestamp + '">Edit</button><div class="audit-trail" id="audit-' + rec.id + '">' + (rec.is_adjusted ? 'Adjusted' : 'Original') + '</div></td>';
            html += '</tr>';
            html += '<tr id="editrow-' + rec.id + '" style="display:none;">';
            html += '<td colspan="5"><div class="edit-form">';
            html += '<input type="text" id="edit-ts-' + rec.id + '" placeholder="YY/MM/DD HH:MM:SS" value="' + rec.timestamp + '">';
            html += '<select id="edit-reason-' + rec.id + '">';
            html += '<option value="">-- Select Reason --</option>';
            html += '<option value="Biometric device failed">Biometric device failed</option>';
            html += '<option value="Biometric offline">Biometric offline</option>';
            html += '<option value="Employee forgot to punch">Employee forgot to punch</option>';
            html += '<option value="System error">System error</option>';
            html += '<option value="Manual override">Manual override</option>';
            html += '</select>';
            html += '<button class="btn-save" data-id="' + rec.id + '">Save</button>';
            html += '<button class="btn-cancel" data-id="' + rec.id + '">Cancel</button>';
            html += '</div></td></tr>';
        }
        tbody.innerHTML = html;

        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const editRow = document.getElementById('editrow-' + id);
                if (editRow.style.display === 'none') {
                    editRow.style.display = 'table-row';
                } else {
                    editRow.style.display = 'none';
                }
            });
        });

        document.querySelectorAll('.btn-save').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                const newTs = document.getElementById('edit-ts-' + id).value.trim();
                const reason = document.getElementById('edit-reason-' + id).value;
                if (!reason) {
                    alert('Please select a reason.');
                    return;
                }
                if (!newTs.match(/^\d{2}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/)) {
                    alert('Invalid format. Use YY/MM/DD HH:MM:SS');
                    return;
                }
                await adjustAttendance(id, newTs, reason);
                alert('Attendance adjusted');
                renderAttendance();
            });
        });

        document.querySelectorAll('.btn-cancel').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                document.getElementById('editrow-' + id).style.display = 'none';
            });
        });
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Error: ' + err.message + '</td></tr>';
    }
}

document.getElementById('refreshBtn').addEventListener('click', renderAttendance);
document.getElementById('dateFilter').addEventListener('input', renderAttendance);
document.getElementById('statusFilter').addEventListener('change', renderAttendance);
renderAttendance();