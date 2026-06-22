// leave-requests.js – uses global API_BASE from utils.js
// Dropdown and user name are handled by auth.js – do NOT duplicate here.

let currentLeaveId = null;

// Helper: escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Load and render leave requests
async function loadLeaves() {
    const container = document.getElementById('leaveContainer');
    container.innerHTML = 'Loading...';
    try {
        const res = await fetch(API_BASE + 'get_leave_requests.php', { credentials: 'include' });
        const data = await res.json();
        console.log('API response:', data);
        if (!data.success) throw new Error(data.message);
        const leaves = data.data;
        if (!leaves || leaves.length === 0) {
            container.innerHTML = '<p>No leave requests found.</p>';
            return;
        }
        let html = '<table><thead><tr><th>ID</th><th>Name</th><th>Employee ID</th><th>Type</th><th>Start Date</th><th>End Date</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
        for (let req of leaves) {
            let statusClass = `status-${req.status}`;
            html += `<tr>
                <td>${escapeHtml(req.id)}</td>
                <td>${escapeHtml(req.employee_name || '-')}</td>
                <td>${escapeHtml(req.employee_id)}</td>
                <td>${escapeHtml(req.type)}</td>
                <td>${escapeHtml(req.start_date)}</td>
                <td>${escapeHtml(req.end_date)}</td>
                <td>${escapeHtml(req.reason || '-')}</td>
                <td><span class="${statusClass}">${escapeHtml(req.status)}</span></td>
                <td>`;
            if (req.status === 'pending') {
                html += `<button class="btn-review" data-id="${req.id}">Review</button>`;
            } else {
                html += `<span>—</span>`;
            }
            html += `</td></tr>`;
        }
        html += `</tbody></table>`;
        container.innerHTML = html;

        // Attach review button events
        document.querySelectorAll('.btn-review').forEach(btn => {
            btn.addEventListener('click', () => openReviewModal(btn.getAttribute('data-id')));
        });
    } catch(e) {
        container.innerHTML = `<p>Error: ${e.message}</p>`;
        console.error(e);
    }
}

// Open review modal with details
async function openReviewModal(id) {
    try {
        const res = await fetch(API_BASE + 'get_leave_requests.php', { credentials: 'include' });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        const leave = data.data.find(l => l.id == id);
        if (!leave) throw new Error('Leave not found');
        currentLeaveId = leave.id;
        const modalContent = document.getElementById('modalDetails');
        modalContent.innerHTML = `
            <p><strong>Name:</strong> ${escapeHtml(leave.employee_name || '-')}</p>
            <p><strong>Employee ID:</strong> ${escapeHtml(leave.employee_id)}</p>
            <p><strong>Type:</strong> ${escapeHtml(leave.type)}</p>
            <p><strong>Start Date:</strong> ${escapeHtml(leave.start_date)}</p>
            <p><strong>End Date:</strong> ${escapeHtml(leave.end_date)}</p>
            <p><strong>Reason:</strong> ${escapeHtml(leave.reason || '-')}</p>
            <p><strong>Submitted:</strong> ${escapeHtml(leave.created_at || '-')}</p>
        `;
        document.getElementById('reviewModal').style.display = 'flex';
    } catch(e) {
        alert('Error loading details: ' + e.message);
    }
}

// Update leave status (approve/reject)
async function updateStatus(id, status) {
    try {
        const res = await fetch(API_BASE + 'update_leave_status.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ id, status })
        });
        const data = await res.json();
        if (data.success) {
            alert(`Leave request ${status}`);
            closeModal();
            loadLeaves();
        } else {
            alert('Error: ' + data.message);
        }
    } catch(e) {
        alert('Request failed: ' + e.message);
    }
}

// Close modal
function closeModal() {
    document.getElementById('reviewModal').style.display = 'none';
    currentLeaveId = null;
}

// ---- Event listeners for modal buttons ----
document.getElementById('closeModalBtn').onclick = closeModal;
// Close modal when clicking outside
window.onclick = (e) => {
    if (e.target === document.getElementById('reviewModal')) closeModal();
};
document.getElementById('modalApproveBtn').onclick = () => {
    if (currentLeaveId) updateStatus(currentLeaveId, 'approved');
};
document.getElementById('modalRejectBtn').onclick = () => {
    if (currentLeaveId) updateStatus(currentLeaveId, 'rejected');
};

// ---- Initial load ----
loadLeaves();