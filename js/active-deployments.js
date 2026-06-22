// Active Deployments – uses global API_BASE from utils.js
let currentJobId = null;
let currentShiftType = null;

async function loadDeployments() {
    try {
        const res = await fetch(API_BASE + 'get_job_orders.php', { credentials: 'include' });
        const data = await res.json();
        if (data.success && data.data.length > 0) {
            renderDeployments(data.data);
        } else {
            document.getElementById('deploymentsList').innerHTML = '<p style="text-align:center; color: #5a6e7c;">No active deployments.</p>';
        }
    } catch(e) {
        document.getElementById('deploymentsList').innerHTML = '<p style="color:red;">Error loading data.</p>';
    }
}

function renderDeployments(jobs) {
    const container = document.getElementById('deploymentsList');
    let html = '';
    for (let job of jobs) {
        let statusClass = '';
        let statusText = job.status || 'Pending';
        if (statusText === 'Dispatched') statusClass = 'status-dispatched';
        else if (statusText === 'In Progress') statusClass = 'status-progress';
        else if (statusText === 'For Validation') statusClass = 'status-validation';
        else if (statusText === 'Completed') statusClass = 'status-completed';
        else statusClass = 'status-pending';

        let morningTeamDisplay = job.morning_team ? `Team ${job.morning_team}` : (job.assigned_team ? `Team ${job.assigned_team}` : 'Not assigned');
        let nightTeamDisplay = job.night_team ? `Team ${job.night_team}` : 'Not assigned';
        let assignedEmployees = job.assigned_employees || 'None';

        html += `
            <div class="deployment-card">
                <div class="deployment-header">
                    <div class="job-info">
                        <h3>${escapeHtml(job.project_name || job.ticket_no || 'Job Order')}</h3>
                        <div class="job-location">${escapeHtml(job.location || 'No location')} | Start: ${escapeHtml(job.start_date || 'Not set')}</div>
                        <div>
                            <span class="team-badge">Team ${escapeHtml(job.assigned_team || 'N/A')}</span>
                            <span style="margin-left: 10px; font-size:0.85rem; color:#1e4668;">
                                <strong>Assigned Employees:</strong> ${escapeHtml(assignedEmployees)}
                            </span>
                        </div>
                    </div>
                    <div><span class="status-badge ${statusClass}">${escapeHtml(statusText)}</span></div>
                </div>
                <div class="shift-container">
                    <div class="shift-card">
                        <div class="shift-label"><span>Morning</span> Shift:</div>
                        <div><span class="shift-team">${escapeHtml(morningTeamDisplay)}</span></div>
                        <button class="btn-assign-shift morning-btn" data-id="${escapeAttr(job.id)}" data-project="${escapeAttr(job.project_name || job.ticket_no)}">Assign</button>
                    </div>
                    <div class="shift-card">
                        <div class="shift-label"><span>Night</span> Shift:</div>
                        <div><span class="shift-team">${escapeHtml(nightTeamDisplay)}</span></div>
                        <button class="btn-assign-shift night-btn" data-id="${escapeAttr(job.id)}" data-project="${escapeAttr(job.project_name || job.ticket_no)}">Assign</button>
                    </div>
                </div>
                <div class="status-control">
                    <label>Update Status:</label>
                    <select id="status-select-${escapeAttr(job.id)}">
                        <option value="Pending" ${statusText === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Dispatched" ${statusText === 'Dispatched' ? 'selected' : ''}>Dispatched</option>
                        <option value="In Progress" ${statusText === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="For Validation" ${statusText === 'For Validation' ? 'selected' : ''}>For Validation</option>
                        <option value="Completed" ${statusText === 'Completed' ? 'selected' : ''}>Completed</option>
                    </select>
                    <button class="btn-update-status" data-id="${escapeAttr(job.id)}">Update</button>
                </div>
            </div>
        `;
    }
    container.innerHTML = html;

    document.querySelectorAll('.morning-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentJobId = this.dataset.id;
            currentShiftType = 'morning';
            document.getElementById('modalTitle').innerText = 'Assign Morning Shift Team';
            document.getElementById('modalJobInfo').innerHTML = `<strong>${escapeHtml(this.dataset.project)}</strong>`;
            document.getElementById('shiftModal').style.display = 'flex';
        });
    });
    document.querySelectorAll('.night-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentJobId = this.dataset.id;
            currentShiftType = 'night';
            document.getElementById('modalTitle').innerText = 'Assign Night Shift Team';
            document.getElementById('modalJobInfo').innerHTML = `<strong>${escapeHtml(this.dataset.project)}</strong>`;
            document.getElementById('shiftModal').style.display = 'flex';
        });
    });

    document.querySelectorAll('.btn-update-status').forEach(btn => {
        btn.addEventListener('click', async function() {
            const id = this.dataset.id;
            const select = document.getElementById('status-select-' + id);
            const newStatus = select.value;
            try {
                const res = await fetch(API_BASE + 'update_job_order_status.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ id: id, status: newStatus })
                });
                const result = await res.json();
                if (result.success) {
                    alert('Status updated to ' + newStatus);
                    location.reload();
                } else {
                    alert('Error: ' + result.message);
                }
            } catch(e) {
                alert('Request failed');
            }
        });
    });
}

document.getElementById('confirmAssignBtn').onclick = async () => {
    if (!currentJobId || !currentShiftType) return;
    const selectedTeam = document.getElementById('teamSelect').value;
    const payload = currentShiftType === 'morning' 
        ? { id: currentJobId, morning_team: selectedTeam }
        : { id: currentJobId, night_team: selectedTeam };
    try {
        const res = await fetch(API_BASE + 'update_job_order_status.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
            alert(`${currentShiftType === 'morning' ? 'Morning' : 'Night'} shift team assigned`);
            document.getElementById('shiftModal').style.display = 'none';
            location.reload();
        } else {
            alert('Error: ' + result.message);
        }
    } catch(e) {
        alert('Request failed');
    }
};
document.getElementById('closeModalBtn').onclick = () => {
    document.getElementById('shiftModal').style.display = 'none';
};
window.onclick = (e) => {
    if (e.target === document.getElementById('shiftModal')) {
        document.getElementById('shiftModal').style.display = 'none';
    }
};

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}
function escapeAttr(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

loadDeployments();