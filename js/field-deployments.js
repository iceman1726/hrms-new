// field-deployments.js – uses global API_BASE from utils.js
// Dropdown and user name are handled by auth.js – do NOT duplicate here.

function loadDeployments() {
    const statusFilter = document.getElementById('statusFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    // Build query string for filtering (optional – you can also do it server-side)
    let url = API_BASE + 'get_job_orders.php';
    // Since the backend may not support filters, we'll filter client-side as before.

    fetch(url, { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                let orders = data.data;

                // Client-side filtering
                if (statusFilter !== 'all') {
                    orders = orders.filter(o => o.status === statusFilter);
                }
                if (searchTerm) {
                    orders = orders.filter(o => 
                        o.project_name.toLowerCase().includes(searchTerm) || 
                        o.assigned_team.toLowerCase().includes(searchTerm)
                    );
                }

                const container = document.getElementById('tableContainer');
                if (orders.length === 0) {
                    container.innerHTML = '<p style="text-align:center; padding:20px;">No job orders found.</p>';
                    return;
                }

                let html = '<table class="deployments-table"><thead><tr>';
                html += '<th>Order ID</th><th>Project</th><th>Location</th><th>Start Date</th><th>Assigned Team</th><th>Status</th><th>Action</th>';
                html += '</tr></thead><tbody>';

                orders.forEach(order => {
                    let statusClass = '';
                    if (order.status === 'Pending') statusClass = 'status-pending';
                    else if (order.status === 'Dispatched') statusClass = 'status-dispatched';
                    else if (order.status === 'In Progress') statusClass = 'status-progress';
                    else if (order.status === 'For Validation') statusClass = 'status-validation';
                    else if (order.status === 'Completed') statusClass = 'status-completed';

                    html += '<tr>';
                    html += '<td>' + order.id + '</td>';
                    html += '<td>' + order.project_name + '</td>';
                    html += '<td>' + order.location + '</td>';
                    html += '<td>' + order.start_date + '</td>';
                    html += '<td>' + order.assigned_team + '</td>';
                    html += '<td><span class="status-badge ' + statusClass + '">' + order.status + '</span></td>';
                    html += '<td>';
                    html += '<select id="status-select-' + order.id + '">';
                    html += '<option value="Pending"' + (order.status === 'Pending' ? ' selected' : '') + '>Pending</option>';
                    html += '<option value="Dispatched"' + (order.status === 'Dispatched' ? ' selected' : '') + '>Dispatched</option>';
                    html += '<option value="In Progress"' + (order.status === 'In Progress' ? ' selected' : '') + '>In Progress</option>';
                    html += '<option value="For Validation"' + (order.status === 'For Validation' ? ' selected' : '') + '>For Validation</option>';
                    html += '<option value="Completed"' + (order.status === 'Completed' ? ' selected' : '') + '>Completed</option>';
                    html += '</select>';
                    html += '<button class="btn-update" data-id="' + order.id + '">Update</button>';
                    html += '</td></tr>';
                });
                html += '</tbody></table>';
                container.innerHTML = html;

                // Attach update event listeners
                document.querySelectorAll('.btn-update').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const id = this.getAttribute('data-id');
                        const select = document.getElementById('status-select-' + id);
                        const newStatus = select.value;
                        fetch(API_BASE + 'update_job_order_status.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ id: id, status: newStatus })
                        })
                        .then(res => res.json())
                        .then(result => {
                            if (result.success) {
                                alert('Status updated to ' + newStatus);
                                loadDeployments();
                            } else {
                                alert('Error: ' + result.message);
                            }
                        })
                        .catch(err => alert('Fetch error: ' + err));
                    });
                });
            } else {
                document.getElementById('tableContainer').innerHTML = '<p style="color:red;">Error: ' + data.message + '</p>';
            }
        })
        .catch(error => {
            document.getElementById('tableContainer').innerHTML = '<p style="color:red;">Fetch error: ' + error + '</p>';
        });
}

// ---- Event listeners ----
document.getElementById('refreshBtn').addEventListener('click', loadDeployments);
document.getElementById('statusFilter').addEventListener('change', loadDeployments);
document.getElementById('searchInput').addEventListener('input', loadDeployments);

// ---- Initial load ----
loadDeployments();