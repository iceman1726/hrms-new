// auth.js – handles dropdown toggle, user name display, and logout

function initAuth() {
    // ---- Dropdown toggle ----
    const dropbtn = document.getElementById('dropbtn');
    if (dropbtn) {
        dropbtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const menu = document.getElementById('dropdownMenu');
            if (menu) menu.classList.toggle('show');
        });
        // Close dropdown when clicking outside
        window.addEventListener('click', function(e) {
            const dropdowns = document.querySelectorAll('.dropdown-content');
            dropdowns.forEach(function(dropdown) {
                if (dropdown.classList.contains('show')) {
                    // If click is on the button or inside the dropdown, do nothing
                    if (e.target.id === 'dropbtn' || dropdown.contains(e.target)) {
                        return;
                    }
                    dropdown.classList.remove('show');
                }
            });
        });
    }

    // ---- Display user name ----
    const userName = localStorage.getItem('user_name') || 'User';
    const nameDisplay = document.getElementById('userNameDisplay');
    if (nameDisplay) nameDisplay.innerText = userName;

    // ---- Logout handler ----
    window.handleLogout = function() {
        localStorage.clear();
        window.location.href = '/hrms/index.html';
    };

    // ---- Also handle logout from dropdown link ----
    const logoutLink = document.querySelector('#dropdownMenu a:last-child');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.handleLogout();
        });
    }
}

// Run immediately if DOM is ready, otherwise wait for it
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}