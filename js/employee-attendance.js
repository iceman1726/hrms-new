// employee-attendance.js – uses global API_BASE from utils.js
// Dropdown and user name are handled by auth.js – do NOT duplicate here.

const empId = localStorage.getItem('employee_id');

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

async function loadAttendance() {
    const tbody = document.getElementById('attBody');
    
    if (!empId) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-message">No employee ID found.</td></tr>';
        return;
    }

    try {
        const res = await fetch(API_BASE + 'get_attendance.php?employee_id=' + encodeURIComponent(empId), {
            credentials: 'include'
        });
        const data = await res.json();

        if (!data.success) throw new Error(data.message);

        if (data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-message">No attendance records found.</td></tr>';
            return;
        }

        let html = '';
        for (let record of data.data) {
            let statusClass = 'status-present';
            let statusText = 'Present';
            
            if (record.status === 'Late') {
                statusClass = 'status-late';
                statusText = 'Late';
            } else if (record.status === 'Absent') {
                statusClass = 'status-absent';
                statusText = 'Absent';
            }
            
            html += `<tr>
                <td>${escapeHtml(record.date)}</td>
                <td>${escapeHtml(record.time_in || '--:--')}</td>
                <td>${escapeHtml(record.time_out || '--:--')}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
            </tr>`;
        }
        tbody.innerHTML = html;

    } catch (error) {
        console.error('Error loading attendance:', error);
        tbody.innerHTML = '<tr><td colspan="4" class="empty-message">Error loading attendance. Please try again.</td></tr>';
    }
}

// Load attendance on page load
loadAttendance();