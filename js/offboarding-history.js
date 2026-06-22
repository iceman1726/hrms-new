// offboarding-history.js – uses global API_BASE from utils.js
// Dropdown and user name are handled by auth.js – do NOT duplicate here.

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

function getStatusBadge(status) {
    if (status === 'Active') {
        return '<span class="badge-onboard">Active</span>';
    } else if (status === 'On Leave') {
        return '<span class="badge-onboard">On Leave</span>';
    } else if (status === 'Offboarded' || status === 'Inactive') {
        return '<span class="badge-offboard">Offboarded</span>';
    }
    return status;
}

async function loadEmployees() {
    const onboardBody = document.getElementById('onboardBody');
    const offboardBody = document.getElementById('offboardBody');

    try {
        const res = await fetch(API_BASE + 'get_employees.php', { credentials: 'include' });
        const data = await res.json();

        if (!data.success) throw new Error(data.message);

        // Consider 'Active' and 'On Leave' as onboarded
        const onboarded = data.data.filter(emp => 
            emp.status === 'Active' || emp.status === 'On Leave' || emp.status === 'Probationary'
        );
        // Offboarded: status 'Offboarded' or 'Inactive'
        const offboarded = data.data.filter(emp => 
            emp.status === 'Offboarded' || emp.status === 'Inactive'
        );

        // Render Onboarded
        if (onboarded.length === 0) {
            onboardBody.innerHTML = '<tr><td colspan="4" class="empty-message">No onboarded employees.</td></tr>';
        } else {
            let html = '';
            for (let emp of onboarded) {
                html += `<tr>
                    <td>${escapeHtml(emp.name)}</td>
                    <td>${escapeHtml(emp.position)}</td>
                    <td>${escapeHtml(emp.onboard_date || '-')}</td>
                    <td>${getStatusBadge(emp.status)}</td>
                </tr>`;
            }
            onboardBody.innerHTML = html;
        }

        // Render Offboarded
        if (offboarded.length === 0) {
            offboardBody.innerHTML = '<tr><td colspan="4" class="empty-message">No offboarded employees.</td></tr>';
        } else {
            let html = '';
            for (let emp of offboarded) {
                html += `<tr>
                    <td>${escapeHtml(emp.name)}</td>
                    <td>${escapeHtml(emp.position)}</td>
                    <td>${escapeHtml(emp.offboard_date || '-')}</td>
                    <td>${escapeHtml(emp.offboard_reason || '-')}</td>
                </tr>`;
            }
            offboardBody.innerHTML = html;
        }

    } catch (error) {
        onboardBody.innerHTML = `<tr><td colspan="4" class="empty-message">Error: ${error.message}</td></tr>`;
        offboardBody.innerHTML = `<tr><td colspan="4" class="empty-message">Error: ${error.message}</td></tr>`;
    }
}

// ---- Initial load ----
loadEmployees();