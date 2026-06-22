// for-validation.js – uses global API_BASE from utils.js
// Dropdown and user name are handled by auth.js – do NOT duplicate here.

const MY_TEAM = 'Alpha'; // CHANGE TO YOUR TEAM NAME

async function loadJobs() {
    const container = document.getElementById('jobsContainer');
    container.innerHTML = '<div class="message">Loading...</div>';
    try {
        const url = API_BASE + 'get_job_orders.php?nocache=' + Date.now();
        const res = await fetch(url, { credentials: 'include' });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        const jobs = data.data.filter(job =>
            job.status !== 'Completed' &&
            (job.assigned_team === MY_TEAM || job.morning_team === MY_TEAM || job.night_team === MY_TEAM)
        );
        if (jobs.length === 0) {
            container.innerHTML = '<div class="message">No active jobs assigned to your team.</div>';
            return;
        }
        renderJobs(jobs);
    } catch (e) {
        container.innerHTML = `<div class="message">Error: ${e.message}</div>`;
    }
}

function renderJobs(jobs) {
    const container = document.getElementById('jobsContainer');
    let html = '';
    for (let job of jobs) {
        const beforeImg = job.before_photo ? `<img src="${job.before_photo}?t=${Date.now()}" alt="Before">` : '<p>No photo yet</p>';
        const afterImg = job.after_photo ? `<img src="${job.after_photo}?t=${Date.now()}" alt="After">` : '<p>No photo yet</p>';
        html += `
            <div class="job-card" data-id="${job.id}">
                <div class="job-header">
                    <div class="job-title">${escapeHtml(job.ticket_no || job.id)}</div>
                    <div class="status-badge">${escapeHtml(job.status || 'Pending')}</div>
                </div>
                <div class="job-details">
                    <div class="detail-item"><span class="detail-label">Ticket No.:</span> ${escapeHtml(job.ticket_no || '-')}</div>
                    <div class="detail-item"><span class="detail-label">Location:</span> ${escapeHtml(job.location || '-')}</div>
                    <div class="detail-item"><span class="detail-label">Start Date:</span> ${escapeHtml(job.start_date || '-')}</div>
                    <div class="detail-item"><span class="detail-label">Activity:</span> ${escapeHtml(job.activity_type || '-')}</div>
                    <div class="detail-item"><span class="detail-label">Assigned Team:</span> ${escapeHtml(job.assigned_team || '-')}</div>
                    <div class="detail-item"><span class="detail-label">Morning Shift:</span> ${escapeHtml(job.morning_team || 'Not assigned')}</div>
                    <div class="detail-item"><span class="detail-label">Night Shift:</span> ${escapeHtml(job.night_team || 'Not assigned')}</div>
                    <div class="detail-item full-width"><span class="detail-label">Description:</span> ${escapeHtml(job.description_activity || '-')}</div>
                </div>
                <div class="photo-upload">
                    <div class="photo-box">
                        <strong>Before Photo</strong><br>
                        ${beforeImg}
                        <input type="file" accept="image/*" class="before-file" data-id="${job.id}" style="display:block; margin:8px auto;">
                        <button class="btn-upload upload-before" data-id="${job.id}">Upload Before</button>
                    </div>
                    <div class="photo-box">
                        <strong>After Photo</strong><br>
                        ${afterImg}
                        <input type="file" accept="image/*" class="after-file" data-id="${job.id}" style="display:block; margin:8px auto;">
                        <button class="btn-upload upload-after" data-id="${job.id}">Upload After</button>
                    </div>
                </div>
                <div style="text-align: center;">
                    <button class="btn-complete" data-id="${job.id}">Mark as Completed</button>
                </div>
            </div>
        `;
    }
    container.innerHTML = html;

    document.querySelectorAll('.upload-before').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const jobId = btn.getAttribute('data-id');
            const fileInput = btn.parentElement.querySelector('.before-file');
            const file = fileInput.files[0];
            if (!file) { alert('Select a file first'); return; }
            const formData = new FormData();
            formData.append('job_id', jobId);
            formData.append('photo_type', 'before');
            formData.append('photo', file);
            const res = await fetch(API_BASE + 'upload_photo.php', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            const data = await res.json();
            alert(data.message);
            if (data.success) location.reload();
        });
    });
    document.querySelectorAll('.upload-after').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const jobId = btn.getAttribute('data-id');
            const fileInput = btn.parentElement.querySelector('.after-file');
            const file = fileInput.files[0];
            if (!file) { alert('Select a file first'); return; }
            const formData = new FormData();
            formData.append('job_id', jobId);
            formData.append('photo_type', 'after');
            formData.append('photo', file);
            const res = await fetch(API_BASE + 'upload_photo.php', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            const data = await res.json();
            alert(data.message);
            if (data.success) location.reload();
        });
    });
    document.querySelectorAll('.btn-complete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const jobId = btn.getAttribute('data-id');
            if (!confirm('Mark this job as completed? It will be moved to HR reports.')) return;
            const res = await fetch(API_BASE + 'update_job_order_status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ id: jobId, status: 'Completed' })
            });
            const data = await res.json();
            alert(data.message);
            if (data.success) location.reload();
        });
    });
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

loadJobs();