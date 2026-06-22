// completed-job-orders.js – uses global API_BASE from utils.js
// Dropdown and user name are handled by auth.js – do NOT duplicate here.

async function fetchCompletedDeployments() {
    try {
        const res = await fetch(API_BASE + 'get_completed_deployments.php', { credentials: 'include' });
        const data = await res.json();
        if (data.success && data.data.length > 0) {
            renderCompleted(data.data);
        } else {
            document.getElementById('completedList').innerHTML = '<p>No completed job orders yet.</p>';
        }
    } catch (e) {
        document.getElementById('completedList').innerHTML = '<p>Error loading data.</p>';
    }
}

function renderCompleted(deployments) {
    const container = document.getElementById('completedList');
    let html = '';
    for (let dep of deployments) {
        let completedDate = dep.completed_at ? new Date(dep.completed_at).toLocaleDateString() : 'Unknown date';
        let photoHtml = '';
        if (dep.completion_photo) {
            photoHtml = `<div class="completion-photo"><img src="${dep.completion_photo}" alt="Completion proof" class="photo-thumb" data-photo="${dep.completion_photo}"></div>`;
        } else {
            photoHtml = `<div class="completion-photo"><span class="status-badge">No photo</span></div>`;
        }
        html += `
            <div class="job-card">
                <div class="job-info">
                    <h3>Job Order #${dep.job_order_id || dep.id}</h3>
                    <p><strong>Team:</strong> ${dep.team_name || dep.team}</p>
                    <p><strong>Employees:</strong> ${Array.isArray(dep.employees) ? dep.employees.join(', ') : dep.employee_names || 'N/A'}</p>
                    <p><strong>Completed on:</strong> ${completedDate}</p>
                    <span class="status-badge">Completed</span>
                </div>
                ${photoHtml}
            </div>
        `;
    }
    container.innerHTML = html;

    document.querySelectorAll('.photo-thumb').forEach(img => {
        img.addEventListener('click', function() {
            const photoUrl = this.getAttribute('data-photo');
            document.getElementById('modalPhoto').src = photoUrl;
            document.getElementById('photoModal').style.display = 'flex';
        });
    });
}

document.getElementById('closePhotoModal').onclick = function() {
    document.getElementById('photoModal').style.display = 'none';
};
window.onclick = function(e) {
    const modal = document.getElementById('photoModal');
    if (e.target === modal) modal.style.display = 'none';
};

fetchCompletedDeployments();