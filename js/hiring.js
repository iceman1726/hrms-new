// hiring.js – uses global API_BASE from utils.js
// Dropdown and user name are handled by auth.js – do NOT duplicate here.

let currentApplicationId = null;
let currentApproveId = null;

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
    if (status === 'pending') return '<span class="badge-pending">Pending</span>';
    if (status === 'interview_scheduled') return '<span class="badge-interview">Interview Scheduled</span>';
    return status;
}

async function loadApplications() {
    const tbody = document.getElementById('applicationsBody');
    try {
        const res = await fetch(API_BASE + 'get_applications.php', { credentials: 'include' });
        const data = await res.json();

        if (!data.success) throw new Error(data.message);

        if (data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-message">No applications found.</td></tr>';
            return;
        }

        let html = '';
        for (let app of data.data) {
            let statusBadge = getStatusBadge(app.status);
            let actionButtons = `
                <button class="view-details" data-id="${app.id}">Details</button>
            `;
            if (app.status === 'pending') {
                actionButtons += `
                    <button class="btn-interview" data-id="${app.id}">Schedule Interview</button>
                    <button class="btn-approve" data-id="${app.id}">Approve</button>
                    <button class="btn-reject" data-id="${app.id}">Reject</button>
                `;
            } else if (app.status === 'interview_scheduled') {
                actionButtons += `<span style="font-size:0.7rem; color:#3498db;">Interview: ${escapeHtml(app.interview_type)}</span>`;
            }
            html += `<tr>
                <td>${escapeHtml(app.name)}</td>
                <td>${escapeHtml(app.email)}</td>
                <td>${escapeHtml(app.position_applied)}</td>
                <td>${statusBadge}</td>
                <td>${escapeHtml(app.applied_at)}</td>
                <td>${actionButtons}</td>
            </tr>`;
        }
        tbody.innerHTML = html;
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-message">Error: ${error.message}</td></tr>`;
    }
}

function openModal(app) {
    const modal = document.getElementById('detailsModal');
    const body = document.getElementById('detailsBody');
    body.innerHTML = `
        <div class="field"><strong>Name:</strong> ${escapeHtml(app.name)}</div>
        <div class="field"><strong>Email:</strong> ${escapeHtml(app.email)}</div>
        <div class="field"><strong>Phone:</strong> ${escapeHtml(app.phone || '-')}</div>
        <div class="field"><strong>Date of Birth:</strong> ${escapeHtml(app.date_of_birth || '-')}</div>
        <div class="field"><strong>Address:</strong> ${escapeHtml(app.address || '-')}</div>
        <div class="field"><strong>Position:</strong> ${escapeHtml(app.position_applied)}</div>
        <div class="field"><strong>Years Experience:</strong> ${escapeHtml(app.years_experience || '0')}</div>
        <div class="field"><strong>Skills:</strong> ${escapeHtml(app.skills || '-')}</div>
        <div class="field"><strong>Experience:</strong> ${escapeHtml(app.experience || '-')}</div>
        <div class="field"><strong>Emergency Contact:</strong> ${escapeHtml(app.emergency_contact || '-')}</div>
        <div class="field"><strong>Emergency Phone:</strong> ${escapeHtml(app.emergency_phone || '-')}</div>
        ${app.interview_type ? `<div class="field"><strong>Interview Type:</strong> ${escapeHtml(app.interview_type)}</div>` : ''}
        ${app.interview_date ? `<div class="field"><strong>Interview Date:</strong> ${escapeHtml(app.interview_date)}</div>` : ''}
        <div class="field"><strong>Applied:</strong> ${escapeHtml(app.applied_at)}</div>
    `;
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('detailsModal').style.display = 'none';
}

function openInterviewModal(id) {
    currentApplicationId = id;
    document.getElementById('interviewModal').style.display = 'flex';
}

function closeInterviewModal() {
    document.getElementById('interviewModal').style.display = 'none';
    currentApplicationId = null;
}

function openApproveModal(app) {
    currentApproveId = app.id;
    document.getElementById('approveApplicantName').innerHTML = '<strong>' + escapeHtml(app.name) + '</strong> – ' + escapeHtml(app.position_applied);
    document.getElementById('empId').value = '';
    document.getElementById('empEmail').value = app.email;
    document.getElementById('empRole').value = 'employee';
    document.getElementById('dailyRate').value = '';
    document.getElementById('approveMessage').textContent = '';
    document.getElementById('approveModal').style.display = 'flex';
}

function closeApproveModal() {
    document.getElementById('approveModal').style.display = 'none';
    currentApproveId = null;
}

document.getElementById('approveForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const employee_id = document.getElementById('empId').value.trim();
    const email = document.getElementById('empEmail').value.trim();
    const role = document.getElementById('empRole').value;
    const daily_rate = document.getElementById('dailyRate').value.trim();
    const msgDiv = document.getElementById('approveMessage');

    if (!employee_id || !email || !daily_rate) {
        msgDiv.innerHTML = '<span style="color:red;">Please fill all fields.</span>';
        return;
    }

    msgDiv.innerHTML = 'Creating account...';

    try {
        const res = await fetch(API_BASE + 'create_employee_account.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                application_id: currentApproveId,
                employee_id: employee_id,
                email: email,
                role: role,
                daily_rate: daily_rate
            })
        });
        const data = await res.json();
        if (data.success) {
            msgDiv.innerHTML = '<span style="color:green;">✅ ' + data.message + '</span>';
            setTimeout(() => {
                closeApproveModal();
                loadApplications();
            }, 1500);
        } else {
            msgDiv.innerHTML = '<span style="color:red;">Error: ' + data.message + '</span>';
        }
    } catch (error) {
        msgDiv.innerHTML = '<span style="color:red;">Error: ' + error.message + '</span>';
    }
});

document.getElementById('applicationsBody').addEventListener('click', async function(e) {
    const btn = e.target;
    const id = btn.getAttribute('data-id');

    if (btn.classList.contains('view-details')) {
        try {
            const res = await fetch(API_BASE + 'get_applications.php', { credentials: 'include' });
            const data = await res.json();
            const app = data.data.find(a => a.id == id);
            if (app) openModal(app);
        } catch (error) {
            alert('Error loading details');
        }
    }

    if (btn.classList.contains('btn-interview')) {
        openInterviewModal(id);
    }

    if (btn.classList.contains('btn-approve')) {
        try {
            const res = await fetch(API_BASE + 'get_applications.php', { credentials: 'include' });
            const data = await res.json();
            const app = data.data.find(a => a.id == id);
            if (app) openApproveModal(app);
        } catch (error) {
            alert('Error loading application data');
        }
    }

    if (btn.classList.contains('btn-reject')) {
        if (!confirm('Reject this application?')) return;
        try {
            const res = await fetch(API_BASE + 'reject_application.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id })
            });
            const data = await res.json();
            alert(data.message);
            loadApplications();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }
});

document.getElementById('interviewForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const interview_type = document.getElementById('interviewType').value;
    const interview_date = document.getElementById('interviewDateTime').value;
    const interview_notes = document.getElementById('interviewNotes').value.trim();

    if (!interview_type || !interview_date) {
        alert('Please fill all required fields.');
        return;
    }

    try {
        const res = await fetch(API_BASE + 'schedule_interview.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: currentApplicationId,
                interview_type,
                interview_date,
                interview_notes
            })
        });
        const data = await res.json();
        alert(data.message);
        closeInterviewModal();
        loadApplications();
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// ---- Initial load ----
loadApplications();