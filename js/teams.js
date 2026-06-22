// teams.js – uses global API_BASE from utils.js
// Dropdown and user name are handled by auth.js – do NOT duplicate here.

async function fetchTeams() {
    try {
        const empRes = await fetch(API_BASE + 'get_employees.php', { credentials: 'include' });
        const empData = await empRes.json();
        if (!empData.success) throw new Error();
        const employees = empData.data;

        const teams = {};
        for (let emp of employees) {
            let team = emp.current_team;
            if (team && team !== '') {
                if (!teams[team]) teams[team] = [];
                teams[team].push(emp);
            }
        }
        // Predefined team names for display
        const allTeamNames = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf'];
        for (let name of allTeamNames) {
            if (!teams[name]) teams[name] = [];
        }
        renderTeams(teams);
    } catch (e) {
        document.getElementById('teamsContainer').innerHTML = '<p>Error loading teams.</p>';
    }
}

function renderTeams(teams) {
    const container = document.getElementById('teamsContainer');
    let html = '';
    for (let [teamName, members] of Object.entries(teams)) {
        html += `<div class="team-card"><h3>Team ${teamName}</h3>`;
        if (members.length === 0) {
            html += '<p style="color: gray; font-size: 0.8rem;">No members assigned.</p>';
        } else {
            html += '<ul class="employee-list">';
            for (let member of members) {
                html += `<li>${member.name} <button class="unassign-btn" data-id="${member.id}" data-team="${teamName}">Remove</button></li>`;
            }
            html += '</ul>';
        }
        html += '</div>';
    }
    container.innerHTML = html;

    document.querySelectorAll('.unassign-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const empId = this.getAttribute('data-id');
            const team = this.getAttribute('data-team');
            if (confirm(`Remove employee from Team ${team}? They will become available.`)) {
                await unassignEmployee(empId);
            }
        });
    });
}

async function unassignEmployee(empId) {
    try {
        const res = await fetch(API_BASE + 'unassign_employee.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ employee_id: empId })
        });
        const data = await res.json();
        if (data.success) {
            alert('Employee removed from team and is now available.');
            location.reload();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (e) {
        alert('Request failed: ' + e.message);
    }
}

fetchTeams();