// create-account.js – uses global API_BASE from utils.js
// Dropdown and user name are handled by auth.js – do NOT duplicate here.

document.getElementById('createAccountForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('newName').value.trim();
    const email = document.getElementById('newEmail').value.trim();
    const employee_id = document.getElementById('newEmployeeId').value.trim();
    const position = document.getElementById('newPosition').value.trim();
    const role = document.getElementById('newRole').value;
    const daily_rate = document.getElementById('dailyRate').value.trim();
    const password = document.getElementById('newPassword').value.trim();
    const msgDiv = document.getElementById('message');

    msgDiv.className = 'message';
    msgDiv.textContent = '';

    if (!name || !email || !employee_id || !position || !daily_rate) {
        msgDiv.className = 'message error';
        msgDiv.textContent = 'All fields are required.';
        return;
    }

    msgDiv.textContent = 'Creating account...';

    try {
        const res = await fetch(API_BASE + 'register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name, email, employee_id, position, role, daily_rate, password
            })
        });
        const data = await res.json();

        if (data.success) {
            msgDiv.className = 'message success';
            msgDiv.textContent = 'Account created successfully for ' + name + '!';
            document.getElementById('newName').value = '';
            document.getElementById('newEmail').value = '';
            document.getElementById('newEmployeeId').value = '';
            document.getElementById('newPosition').value = '';
            document.getElementById('dailyRate').value = '';
            document.getElementById('newPassword').value = 'password';
        } else {
            msgDiv.className = 'message error';
            msgDiv.textContent = 'Error: ' + data.message;
        }
    } catch (error) {
        msgDiv.className = 'message error';
        msgDiv.textContent = 'Error: ' + error.message;
    }
});