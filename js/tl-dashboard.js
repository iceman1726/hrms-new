// tl-dashboard.js – uses global API_BASE from utils.js
// Dropdown and user name are handled by auth.js – do NOT duplicate here.

const MY_TEAM = 'Alpha';
let teamMembers = [];
let attendanceStats = {};

async function fetchTeamMembers() {
    try {
        const res = await fetch(API_BASE + 'get_employees.php', { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
            teamMembers = data.data.filter(emp => emp.current_team === MY_TEAM);
            generateMockAttendance();
            renderTeamMembers();
        } else {
            console.error('Failed to fetch employees');
        }
    } catch (e) {
        console.error(e);
    }
}

function generateMockAttendance() {
    const days = 30;
    for (let emp of teamMembers) {
        let present = 0,
            late = 0,
            absent = 0;
        for (let i = 0; i < days; i++) {
            let r = Math.random();
            if (r < 0.7) present++;
            else if (r < 0.85) late++;
            else absent++;
        }
        attendanceStats[emp.id] = { present, late, absent, name: emp.name };
    }
}

function renderTeamMembers() {
    const container = document.getElementById('teamMembersList');
    if (teamMembers.length === 0) {
        container.innerHTML = '<p>No team members found.</p>';
        return;
    }
    let html = '';
    for (let emp of teamMembers) {
        let stats = attendanceStats[emp.id] || { present: 0, late: 0, absent: 0 };
        html += `<div class="member-card">
                            <div><strong>${escapeHtml(emp.name)}</strong></div>
                            <div class="member-stats">Present: ${stats.present} | Late: ${stats.late} | Absent: ${stats.absent}</div>
                         </div>`;
    }
    container.innerHTML = html;
}

document.getElementById('viewMoreAttendanceBtn').addEventListener('click', () => {
    const modal = document.getElementById('attendanceModal');
    const detailDiv = document.getElementById('attendanceDetail');
    let detailHtml = '<table style="width:100%; border-collapse: collapse;"><tr><th>Employee</th><th>Present</th><th>Late</th><th>Absent</th></tr>';
    for (let emp of teamMembers) {
        let stats = attendanceStats[emp.id] || { present: 0, late: 0, absent: 0 };
        detailHtml += `<tr><td>${escapeHtml(emp.name)}</td><td>${stats.present}</td><td>${stats.late}</td><td>${stats.absent}</td></tr>`;
    }
    detailHtml += '</table><p style="margin-top:1rem;">Last 30 days (mock data – integrate with biometrics later).</p>';
    detailDiv.innerHTML = detailHtml;
    modal.style.display = 'flex';
});

function closeAttendanceModal() {
    document.getElementById('attendanceModal').style.display = 'none';
}
window.onclick = function(e) {
    const modal = document.getElementById('attendanceModal');
    if (e.target === modal) modal.style.display = 'none';
};

async function fetchActiveDeployments() {
    const container = document.getElementById('deploymentsList');
    container.innerHTML = '<p>Loading...</p>';
    try {
        const res = await fetch(API_BASE + 'get_job_orders.php', { credentials: 'include' });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        const jobs = data.data.filter(job =>
            job.status !== 'Completed' &&
            (job.assigned_team === MY_TEAM || job.morning_team === MY_TEAM || job.night_team === MY_TEAM)
        );
        if (jobs.length === 0) {
            container.innerHTML = '<p>No active deployments needing validation.</p>';
            return;
        }
        renderDeployments(jobs);
    } catch (e) {
        container.innerHTML = `<p>Error: ${e.message}</p>`;
    }
}

function renderDeployments(jobs) {
    const container = document.getElementById('deploymentsList');
    let html = '';
    for (let job of jobs) {
        html += `
                    <div class="deployment-card">
                        <div class="deployment-info">
                            <strong>${escapeHtml(job.project_name || job.ticket_no || 'Job Order')}</strong><br>
                            ${escapeHtml(job.location || '-')}<br>
                            Status: <span class="status-badge" style="background:#f39c12; padding:2px 8px; border-radius:20px; font-size:0.7rem;">${escapeHtml(job.status)}</span>
                        </div>
                        <button class="btn-view" data-id="${job.id}">View</button>
                    </div>
                `;
    }
    container.innerHTML = html;

    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', () => {
            const jobId = btn.getAttribute('data-id');
            window.location.href = `for-validation.html?job_id=${jobId}`;
        });
    });
}

document.getElementById('viewAllDeploymentsBtn').addEventListener('click', () => {
    window.location.href = 'for-validation.html';
});

async function fetchPendingLeaves() {
    const container = document.getElementById('pendingLeaves');
    container.innerHTML = '<p>Loading...</p>';
    try {
        const res = await fetch(API_BASE + 'get_leave_requests.php', { credentials: 'include' });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        const teamMemberIds = teamMembers.map(emp => emp.id);
        const pendingLeaves = data.data.filter(leave => teamMemberIds.includes(leave.employee_id) && leave.status === 'pending');
        if (pendingLeaves.length === 0) {
            container.innerHTML = '<p>No pending leave requests.</p>';
            return;
        }
        renderPendingLeaves(pendingLeaves);
    } catch (e) {
        container.innerHTML = `<p>Error: ${e.message}</p>`;
    }
}

function renderPendingLeaves(leaves) {
    const container = document.getElementById('pendingLeaves');
    let html = '';
    for (let l of leaves) {
        html += `
                    <div class="leave-item">
                        <div><strong>${escapeHtml(l.employee_name || 'Employee')}</strong> - ${escapeHtml(l.type)}<br>${l.start_date} to ${l.end_date}<br><small>${escapeHtml(l.reason || '-')}</small></div>
                        <div><em>Pending HR approval</em></div>
                    </div>
                `;
    }
    container.innerHTML = html;
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

async function init() {
    await fetchTeamMembers();
    await fetchActiveDeployments();
    await fetchPendingLeaves();
}
init();