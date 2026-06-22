// employee-deployment-history.js – uses global API_BASE from utils.js
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

function getStatusClass(status) {
    if (status === 'Completed') return 'status-completed';
    return 'status-progress';
}

async function loadDeployments() {
    const tbody = document.getElementById('deploymentBody');
    
    if (!empId) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-message">No employee ID found.</td></tr>';
        return;
    }

    try {
        const res = await fetch(API_BASE + 'get_deployments.php?employee_id=' + encodeURIComponent(empId), {
            credentials: 'include'
        });
        const data = await res.json();

        if (!data.success) throw new Error(data.message);

        if (data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-message">No deployment records found.</td></tr>';
            return;
        }

        let html = '';
        for (let d of data.data) {
            const statusClass = getStatusClass(d.status);
            html += `<tr>
                <td>${escapeHtml(d.start_date)}</td>
                <td>${escapeHtml(d.end_date)}</td>
                <td>${escapeHtml(d.project)}</td>
                <td>${escapeHtml(d.location)}</td>
                <td>${escapeHtml(d.role || '-')}</td>
                <td class="${statusClass}">${escapeHtml(d.status)}</td>
            </tr>`;
        }
        tbody.innerHTML = html;

    } catch (error) {
        console.error('Error loading deployments:', error);
        tbody.innerHTML = `<tr><td colspan="6" class="empty-message">Error: ${error.message}</td></tr>`;
    }
}

// Load deployments on page load
loadDeployments();