document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        employee_id: document.getElementById('employee_id').value,
        position: document.getElementById('position').value,
        role: document.getElementById('role').value,
        password: document.getElementById('password').value
    };
    const res = await fetch('/hrms/backend/api/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const result = await res.json();
    document.getElementById('message').innerHTML = result.message;
});