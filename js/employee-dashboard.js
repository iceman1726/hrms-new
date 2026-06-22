// employee-dashboard.js – uses global API_BASE from utils.js
// Dropdown and user name are handled by auth.js – do NOT duplicate here.

const CACHE_KEY = 'leave_history_cache';

function getCachedLeaves() {
    try {
        return JSON.parse(localStorage.getItem(CACHE_KEY)) || [];
    } catch { return []; }
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

async function loadDashboard() {
    const empId = localStorage.getItem('employee_id');
    if (!empId) {
        document.getElementById('pendingCount').innerText = '0';
        document.getElementById('totalLeaves').innerText = '0';
        document.getElementById('recentHistoryBody').innerHTML = '<tr><td colspan="4">No leave history found.</td></tr>';
        document.getElementById('daysPresent').innerText = '0';
        return;
    }

    // --- Load leave data ---
    let leaves = [];
    try {
        const res = await fetch(API_BASE + 'get_leave_requests.php', { credentials: 'include' });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
            leaves = data.data;
            localStorage.setItem(CACHE_KEY, JSON.stringify(leaves));
        } else {
            throw new Error('Server error');
        }
    } catch (e) {
        console.warn('Server failed, using cache:', e);
        leaves = getCachedLeaves();
    }

    const myLeaves = leaves.filter(l => String(l.employee_id) === String(empId));

    const pending = myLeaves.filter(l => l.status === 'pending').length;
    document.getElementById('pendingCount').innerText = pending;

    const approved = myLeaves.filter(l => l.status === 'approved').length;
    document.getElementById('totalLeaves').innerText = approved;

    // --- Load attendance for days present ---
    try {
        const attRes = await fetch(API_BASE + 'get_attendance.php?employee_id=' + encodeURIComponent(empId), {
            credentials: 'include'
        });
        const attData = await attRes.json();
        if (attData.success && attData.data.length > 0) {
            const now = new Date();
            const month = now.getMonth();
            const year = now.getFullYear();
            const presentCount = attData.data.filter(record => {
                const recordDate = new Date(record.date);
                return record.status === 'Present' && recordDate.getMonth() === month && recordDate.getFullYear() === year;
            }).length;
            document.getElementById('daysPresent').innerText = presentCount;
        } else {
            document.getElementById('daysPresent').innerText = '0';
        }
    } catch (e) {
        console.warn('Could not load attendance:', e);
        document.getElementById('daysPresent').innerText = '0';
    }

    // --- Recent leave history ---
    const recent = myLeaves.slice(0, 5);
    const tbody = document.getElementById('recentHistoryBody');
    if (recent.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">No leave history found.</td></tr>';
    } else {
        let html = '';
        for (let l of recent) {
            const statusClass = `status-${l.status}`;
            const statusText = l.status.charAt(0).toUpperCase() + l.status.slice(1);
            html += `<tr>
                        <td>${escapeHtml(l.type)}</td>
                        <td>${escapeHtml(l.start_date)}</td>
                        <td>${escapeHtml(l.end_date)}</td>
                        <td><span class="${statusClass}">${statusText}</span></td>
                    </tr>`;
        }
        tbody.innerHTML = html;
    }
}

// Load dashboard on page load
document.addEventListener('DOMContentLoaded', loadDashboard);