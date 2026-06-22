// notifications.js – uses API_BASE from utils.js
const NOTIF_API = API_BASE + 'get_notifications.php';
const MARK_READ_API = API_BASE + 'mark_notification_read.php';

// Fetch notifications and update UI
async function loadNotifications() {
    try {
        // --- OPTIONAL: Pass role for access-level filtering ---
        // If your backend expects a 'role' parameter, uncomment the next lines.
        // const role = localStorage.getItem('user_role') || '';
        // const url = NOTIF_API + (role ? '?role=' + encodeURIComponent(role) : '');
        // const res = await fetch(url, { credentials: 'include' });
        // --- Otherwise, use the default (session-based) ---
        const res = await fetch(NOTIF_API, { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
            updateNotificationUI(data.data, data.unread_count);
        }
    } catch (e) {
        console.error('Failed to load notifications:', e);
    }
}

// Update the bell icon, dropdown, and ALL sidebar badges
function updateNotificationUI(notifications, unreadCount) {
    // ---- 1. Update ALL badge elements (top-bar + sidebar) ----
    const allBadges = document.querySelectorAll('.notif-badge, .notif-badge-sidebar');
    allBadges.forEach(badge => {
        if (unreadCount > 0) {
            badge.style.display = 'inline-block';
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        } else {
            badge.style.display = 'none';
        }
    });

    // ---- 2. Update the dropdown list (only one exists) ----
    const list = document.getElementById('notifList');
    if (list) {
        if (!notifications || notifications.length === 0) {
            list.innerHTML = '<div class="notif-empty">No notifications</div>';
            return;
        }
        let html = '';
        notifications.forEach(notif => {
            const isRead = notif.is_read ? 'notif-read' : 'notif-unread';
            const link = notif.link || '#';
            html += `
                <div class="notif-item ${isRead}" data-id="${notif.id}">
                    <a href="${link}" class="notif-link" onclick="markAndNavigate(${notif.id}, '${link}'); return false;">
                        <div class="notif-message">${escapeHtml(notif.message)}</div>
                        <div class="notif-time">${timeAgo(notif.created_at)}</div>
                    </a>
                </div>
            `;
        });
        list.innerHTML = html;
    }
}

// Mark notification as read and navigate to link
function markAndNavigate(id, link) {
    fetch(MARK_READ_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: id })
    }).then(() => {
        loadNotifications();
        if (link && link !== '#') {
            window.location.href = link;
        }
    }).catch(() => {
        if (link && link !== '#') {
            window.location.href = link;
        }
    });
}

// Helper: escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        if (m === '"') return '&quot;';
        return m;
    });
}

// Helper: time ago (simple version)
function timeAgo(timestamp) {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return minutes + 'm ago';
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + 'h ago';
    const days = Math.floor(hours / 24);
    return days + 'd ago';
}

// Toggle dropdown
function toggleNotifDropdown() {
    const dropdown = document.getElementById('notifDropdown');
    if (dropdown) dropdown.classList.toggle('show');
}

// Close dropdown when clicking outside (attached immediately)
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('notifDropdown');
    const btn = document.getElementById('notifBell');
    if (dropdown && btn && e.target !== btn && !dropdown.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

// ---- INIT: run immediately if DOM is ready ----
function initNotifications() {
    loadNotifications();
    setInterval(loadNotifications, 30000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotifications);
} else {
    initNotifications();
}