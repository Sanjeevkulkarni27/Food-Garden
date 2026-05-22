/* ═══════════════════════════════════════════════════════════════
   FOOD GARDEN — ADMIN DASHBOARD LOGIC
   Complete admin panel with auth, CRUD operations & real-time UI
   ═══════════════════════════════════════════════════════════════ */

// ── State ──
let allReservations = [];
let allMessages = [];
let allMenuItems = [];
let currentFilter = 'all';
let currentMessageFilter = 'all';
let currentMenuFilter = 'all';

// ── DOM References ──
const loginScreen = document.getElementById('loginScreen');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const sidebar = document.getElementById('sidebar');
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebarClose = document.getElementById('sidebarClose');
const pageTitle = document.getElementById('pageTitle');
const adminName = document.getElementById('adminName');


/* ═══════════════════════════════════════════════════════════════
   API HELPER
   ═══════════════════════════════════════════════════════════════ */
async function api(url, options = {}) {
    try {
        const config = {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            ...options,
        };
        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }
        const res = await fetch(url, config);
        
        // Handle auth errors globally
        if (res.status === 401) {
            showLogin();
            showToast('Session expired. Please log in again.', 'error');
            return null;
        }

        const data = await res.json().catch(() => null);
        
        if (!res.ok) {
            throw new Error(data?.message || `Request failed (${res.status})`);
        }
        
        return data;
    } catch (err) {
        console.error('API Error:', err);
        throw err;
    }
}


/* ═══════════════════════════════════════════════════════════════
   AUTH
   ═══════════════════════════════════════════════════════════════ */
async function checkAuth() {
    try {
        const data = await api('/api/admin/check');
        if (data && data.authenticated) {
            adminName.textContent = data.username || 'Admin';
            showDashboard();
        } else {
            showLogin();
        }
    } catch {
        showLogin();
    }
}

function showLogin() {
    loginScreen.style.display = 'flex';
    dashboard.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function showDashboard() {
    loginScreen.style.display = 'none';
    dashboard.style.display = 'flex';
    document.body.style.overflow = 'auto';
    loadAllData();
}

// Login form handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        showLoginError('Please enter both username and password.');
        return;
    }

    loginBtn.classList.add('loading');
    loginBtn.querySelector('span').textContent = 'Signing in...';
    loginError.style.display = 'none';

    try {
        const data = await api('/api/admin/login', {
            method: 'POST',
            body: { username, password },
        });

        if (data) {
            adminName.textContent = data.username || username;
            showDashboard();
            showToast('Welcome back! 🌿', 'success');
            loginForm.reset();
        }
    } catch (err) {
        showLoginError(err.message || 'Invalid credentials. Please try again.');
    } finally {
        loginBtn.classList.remove('loading');
        loginBtn.querySelector('span').textContent = 'Sign In';
    }
});

function showLoginError(msg) {
    loginError.style.display = 'flex';
    loginError.querySelector('span').textContent = msg;
    // Re-trigger shake animation
    loginError.style.animation = 'none';
    loginError.offsetHeight; // force reflow
    loginError.style.animation = '';
}

// Logout
logoutBtn.addEventListener('click', async () => {
    try {
        await api('/api/admin/logout', { method: 'POST' });
    } catch {
        // Even if logout API fails, clear client state
    }
    showLogin();
    showToast('Logged out successfully.', 'info');
});

// Password visibility toggle
function togglePasswordVisibility() {
    const input = document.getElementById('loginPassword');
    const icon = document.querySelector('.toggle-password i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}


/* ═══════════════════════════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════════════════════════ */
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');

const tabTitles = {
    dashboardTab: 'Dashboard',
    reservationsTab: 'Reservations',
    messagesTab: 'Messages',
    menuTab: 'Menu Management',
};

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab(item.dataset.tab);
    });
});

// Also wire up "View All" links
document.querySelectorAll('.view-all-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab(link.dataset.tab);
    });
});

function switchTab(tabId) {
    // Update nav
    navItems.forEach(n => n.classList.remove('active'));
    const activeNav = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    if (activeNav) activeNav.classList.add('active');

    // Update content
    tabContents.forEach(t => t.classList.remove('active'));
    const activeTab = document.getElementById(tabId);
    if (activeTab) activeTab.classList.add('active');

    // Update page title
    pageTitle.textContent = tabTitles[tabId] || 'Dashboard';

    // Close sidebar on mobile
    closeSidebar();
}

// Sidebar mobile toggle
hamburgerBtn.addEventListener('click', openSidebar);
sidebarClose.addEventListener('click', closeSidebar);

function openSidebar() {
    sidebar.classList.add('open');
    getOrCreateOverlay().classList.add('active');
}

function closeSidebar() {
    sidebar.classList.remove('open');
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) overlay.classList.remove('active');
}

function getOrCreateOverlay() {
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.addEventListener('click', closeSidebar);
        document.body.appendChild(overlay);
    }
    return overlay;
}


/* ═══════════════════════════════════════════════════════════════
   LOAD ALL DATA
   ═══════════════════════════════════════════════════════════════ */
function loadAllData() {
    loadStats();
    loadRecentReservations();
    loadReservations();
    loadMessages();
    loadMenuItems();
}


/* ═══════════════════════════════════════════════════════════════
   DASHBOARD — STATS
   ═══════════════════════════════════════════════════════════════ */
async function loadStats() {
    try {
        // Fetch all data in parallel
        const [reservations, messages, menuItems] = await Promise.all([
            api('/api/reservations').catch(() => []),
            api('/api/contacts').catch(() => []),
            api('/api/menu').catch(() => []),
        ]);

        const resList = Array.isArray(reservations) ? reservations : (reservations?.data || []);
        const msgList = Array.isArray(messages) ? messages : (messages?.data || []);
        const menuList = Array.isArray(menuItems) ? menuItems : (menuItems?.data || []);

        // Today's reservations
        const today = new Date().toISOString().split('T')[0];
        const todayCount = resList.filter(r => {
            const resDate = r.date ? r.date.split('T')[0] : '';
            return resDate === today;
        }).length;

        animateCounter('todayReservations', todayCount);
        animateCounter('totalReservations', resList.length);
        animateCounter('unreadMessages', msgList.filter(m => !m.isRead).length);
        animateCounter('menuItemsCount', menuList.length);

        // Update nav badges
        const unread = msgList.filter(m => !m.isRead).length;
        const pending = resList.filter(r => r.status === 'pending').length;
        updateBadge('messagesBadge', unread);
        updateBadge('reservationsBadge', pending);

    } catch (err) {
        console.error('Failed to load stats:', err);
    }
}

function animateCounter(elementId, target) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    const duration = 800;
    const start = parseInt(el.textContent) || 0;
    const diff = target - start;
    const startTime = performance.now();

    function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(start + diff * ease);
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

function updateBadge(badgeId, count) {
    const badge = document.getElementById(badgeId);
    if (!badge) return;
    if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}


/* ═══════════════════════════════════════════════════════════════
   DASHBOARD — RECENT RESERVATIONS
   ═══════════════════════════════════════════════════════════════ */
async function loadRecentReservations() {
    const tbody = document.getElementById('recentReservationsBody');
    
    try {
        const data = await api('/api/reservations');
        const list = Array.isArray(data) ? data : (data?.data || []);
        
        // Sort by date descending, take 5
        const recent = list
            .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
            .slice(0, 5);

        if (recent.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="empty-state">
                <i class="fas fa-calendar-xmark"></i> No reservations yet
            </td></tr>`;
            return;
        }

        tbody.innerHTML = recent.map(r => `
            <tr>
                <td><strong>${escapeHtml(r.name)}</strong></td>
                <td>${formatDate(r.date)}</td>
                <td>${escapeHtml(r.time || '—')}</td>
                <td>${r.guests || '—'}</td>
                <td><span class="status-badge ${r.status || 'pending'}">
                    <i class="fas fa-circle"></i> ${r.status || 'pending'}
                </span></td>
            </tr>
        `).join('');

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state">
            <i class="fas fa-exclamation-triangle"></i> Failed to load
        </td></tr>`;
    }
}


/* ═══════════════════════════════════════════════════════════════
   RESERVATIONS TAB
   ═══════════════════════════════════════════════════════════════ */
async function loadReservations() {
    const tbody = document.getElementById('reservationsBody');
    tbody.innerHTML = `<tr><td colspan="8" class="empty-state">
        <i class="fas fa-spinner fa-spin"></i> Loading reservations...
    </td></tr>`;

    try {
        const data = await api('/api/reservations');
        allReservations = Array.isArray(data) ? data : (data?.data || []);
        renderReservations();
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="8" class="empty-state">
            <i class="fas fa-exclamation-triangle"></i> Failed to load reservations
        </td></tr>`;
    }
}

function renderReservations() {
    const tbody = document.getElementById('reservationsBody');
    let filtered = allReservations;

    if (currentFilter !== 'all') {
        filtered = allReservations.filter(r => r.status === currentFilter);
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="empty-state">
            <i class="fas fa-inbox"></i> No ${currentFilter === 'all' ? '' : currentFilter} reservations found
        </td></tr>`;
        return;
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

    tbody.innerHTML = filtered.map(r => `
        <tr>
            <td><strong>${escapeHtml(r.name)}</strong></td>
            <td>${formatDate(r.date)}</td>
            <td>${escapeHtml(r.time || '—')}</td>
            <td>${r.guests || '—'}</td>
            <td>${escapeHtml(r.seating || '—')}</td>
            <td>${escapeHtml(r.occasion || '—')}</td>
            <td>
                <span class="status-badge ${r.status || 'pending'}">
                    <i class="fas fa-circle"></i> ${r.status || 'pending'}
                </span>
            </td>
            <td>
                <div class="action-btns">
                    ${r.status !== 'confirmed' ? `
                        <button class="action-btn confirm" title="Confirm" onclick="confirmReservation('${r._id}')">
                            <i class="fas fa-check"></i>
                        </button>` : ''}
                    ${r.status !== 'cancelled' ? `
                        <button class="action-btn cancel" title="Cancel" onclick="cancelReservation('${r._id}')">
                            <i class="fas fa-times"></i>
                        </button>` : ''}
                    <button class="action-btn delete" title="Delete" onclick="deleteReservation('${r._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Filter handlers for reservations
document.querySelectorAll('#reservationsTab .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#reservationsTab .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderReservations();
    });
});

async function confirmReservation(id) {
    try {
        await api(`/api/reservations/${id}`, {
            method: 'PATCH',
            body: { status: 'confirmed' },
        });
        showToast('Reservation confirmed! ✓', 'success');
        loadReservations();
        loadStats();
        loadRecentReservations();
    } catch (err) {
        showToast('Failed to confirm reservation.', 'error');
    }
}

async function cancelReservation(id) {
    try {
        await api(`/api/reservations/${id}`, {
            method: 'PATCH',
            body: { status: 'cancelled' },
        });
        showToast('Reservation cancelled.', 'info');
        loadReservations();
        loadStats();
        loadRecentReservations();
    } catch (err) {
        showToast('Failed to cancel reservation.', 'error');
    }
}

async function deleteReservation(id) {
    if (!confirm('Are you sure you want to delete this reservation? This cannot be undone.')) return;

    try {
        await api(`/api/reservations/${id}`, { method: 'DELETE' });
        showToast('Reservation deleted.', 'success');
        loadReservations();
        loadStats();
        loadRecentReservations();
    } catch (err) {
        showToast('Failed to delete reservation.', 'error');
    }
}


/* ═══════════════════════════════════════════════════════════════
   MESSAGES TAB
   ═══════════════════════════════════════════════════════════════ */
async function loadMessages() {
    const grid = document.getElementById('messagesGrid');
    grid.innerHTML = `<div class="empty-state-card">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading messages...</p>
    </div>`;

    try {
        const data = await api('/api/contacts');
        allMessages = Array.isArray(data) ? data : (data?.data || []);
        renderMessages();
    } catch (err) {
        grid.innerHTML = `<div class="empty-state-card">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Failed to load messages</p>
        </div>`;
    }
}

function renderMessages() {
    const grid = document.getElementById('messagesGrid');
    let filtered = allMessages;

    if (currentMessageFilter === 'unread') {
        filtered = allMessages.filter(m => !m.isRead);
    } else if (currentMessageFilter === 'read') {
        filtered = allMessages.filter(m => m.isRead);
    }

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="empty-state-card">
            <i class="fas fa-envelope-open"></i>
            <p>No ${currentMessageFilter === 'all' ? '' : currentMessageFilter} messages</p>
        </div>`;
        return;
    }

    // Sort: unread first, then by date
    filtered.sort((a, b) => {
        if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    grid.innerHTML = filtered.map(m => {
        const initials = getInitials(m.name || 'U');
        return `
        <div class="message-card ${m.isRead ? '' : 'unread'}">
            <div class="message-header">
                <div class="message-sender">
                    <div class="message-avatar">${initials}</div>
                    <div class="message-sender-info">
                        <h4>${escapeHtml(m.name)} ${!m.isRead ? '<span class="unread-dot"></span>' : ''}</h4>
                        <p>${escapeHtml(m.email || '')}</p>
                    </div>
                </div>
                <div class="message-actions">
                    ${!m.isRead ? `
                        <button class="action-btn read" title="Mark as Read" onclick="markAsRead('${m._id}')">
                            <i class="fas fa-check-double"></i>
                        </button>` : ''}
                    <button class="action-btn delete" title="Delete" onclick="deleteMessage('${m._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            ${m.topic ? `<span class="message-topic"><i class="fas fa-tag"></i> ${escapeHtml(m.topic)}</span>` : ''}
            <div class="message-body">${escapeHtml(m.message || m.body || '')}</div>
            <div class="message-time">
                <i class="fas fa-clock"></i> ${formatDate(m.createdAt, true)}
            </div>
        </div>
    `}).join('');
}

// Filter handlers for messages
document.querySelectorAll('#messagesTab .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#messagesTab .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMessageFilter = btn.dataset.filter;
        renderMessages();
    });
});

async function markAsRead(id) {
    try {
        await api(`/api/contacts/${id}`, {
            method: 'PATCH',
            body: { isRead: true },
        });
        showToast('Message marked as read.', 'success');
        loadMessages();
        loadStats();
    } catch (err) {
        showToast('Failed to update message.', 'error');
    }
}

async function deleteMessage(id) {
    if (!confirm('Delete this message?')) return;
    
    try {
        await api(`/api/contacts/${id}`, { method: 'DELETE' });
        showToast('Message deleted.', 'success');
        loadMessages();
        loadStats();
    } catch (err) {
        showToast('Failed to delete message.', 'error');
    }
}


/* ═══════════════════════════════════════════════════════════════
   MENU TAB
   ═══════════════════════════════════════════════════════════════ */
async function loadMenuItems() {
    const grid = document.getElementById('menuGrid');
    grid.innerHTML = `<div class="empty-state-card">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading menu items...</p>
    </div>`;

    try {
        const data = await api('/api/menu');
        allMenuItems = Array.isArray(data) ? data : (data?.data || []);
        renderMenuItems();
    } catch (err) {
        grid.innerHTML = `<div class="empty-state-card">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Failed to load menu items</p>
        </div>`;
    }
}

function renderMenuItems() {
    const grid = document.getElementById('menuGrid');
    let filtered = allMenuItems;

    if (currentMenuFilter !== 'all') {
        filtered = allMenuItems.filter(item => 
            (item.category || '').toLowerCase() === currentMenuFilter
        );
    }

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="empty-state-card">
            <i class="fas fa-bowl-food"></i>
            <p>No ${currentMenuFilter === 'all' ? '' : currentMenuFilter} menu items found</p>
        </div>`;
        return;
    }

    grid.innerHTML = filtered.map(item => {
        const badges = (item.badges || []);
        const badgeEmojis = {
            'veg': '🌿',
            'spicy': '🌶️',
            'chef-special': '👨‍🍳',
            'new': '✨',
        };
        
        return `
        <div class="menu-card ${item.isAvailable === false ? 'unavailable' : ''}">
            <div class="menu-card-image">
                ${item.image 
                    ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" onerror="this.style.display='none'">`
                    : `<div style="height:100%;display:flex;align-items:center;justify-content:center;color:var(--gray-400);font-size:2.5rem;"><i class="fas fa-image"></i></div>`
                }
                <div class="menu-card-overlay">
                    <button class="overlay-btn edit" title="Edit" onclick='openMenuModal(${JSON.stringify(item).replace(/'/g, "&#39;")})'>
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="overlay-btn del" title="Delete" onclick="deleteMenuItem('${item._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                ${item.isAvailable === false ? '<span class="menu-card-unavailable">Unavailable</span>' : ''}
            </div>
            <div class="menu-card-body">
                <span class="menu-card-category">
                    <i class="fas fa-tag"></i> ${escapeHtml(item.category || 'Uncategorized')}
                </span>
                <div class="menu-card-name">${escapeHtml(item.name)}</div>
                <div class="menu-card-desc">${escapeHtml(item.description || '')}</div>
                <div class="menu-card-footer">
                    <span class="menu-card-price">₹${item.price || 0}</span>
                    <div class="menu-card-badges">
                        ${badges.map(b => `<span class="menu-badge" title="${b}">${badgeEmojis[b] || '🏷️'}</span>`).join('')}
                    </div>
                </div>
            </div>
            <div class="menu-card-toggle">
                <label class="toggle-switch">
                    <input type="checkbox" ${item.isAvailable !== false ? 'checked' : ''} 
                           onchange="toggleAvailability('${item._id}', ${item.isAvailable !== false})">
                    <span class="toggle-slider"></span>
                    <span class="toggle-label">${item.isAvailable !== false ? 'Available' : 'Unavailable'}</span>
                </label>
            </div>
        </div>
    `}).join('');
}

// Filter handlers for menu
document.querySelectorAll('#menuTab .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#menuTab .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMenuFilter = btn.dataset.filter;
        renderMenuItems();
    });
});

// ── Menu Modal ──
function openMenuModal(item = null) {
    const modal = document.getElementById('menuModal');
    const title = document.getElementById('menuModalTitle');
    const form = document.getElementById('menuForm');

    form.reset();
    document.getElementById('menuItemId').value = '';
    document.getElementById('menuAvailable').checked = true;

    if (item) {
        // Edit mode
        title.innerHTML = '<i class="fas fa-pen-to-square"></i> Edit Menu Item';
        document.getElementById('menuItemId').value = item._id;
        document.getElementById('menuName').value = item.name || '';
        document.getElementById('menuDescription').value = item.description || '';
        document.getElementById('menuPrice').value = item.price || '';
        document.getElementById('menuCategory').value = item.category || '';
        document.getElementById('menuImage').value = item.image || '';
        document.getElementById('menuAvailable').checked = item.isAvailable !== false;

        // Set badge checkboxes
        const badges = item.badges || [];
        document.getElementById('badgeVeg').checked = badges.includes('veg');
        document.getElementById('badgeSpicy').checked = badges.includes('spicy');
        document.getElementById('badgeChef').checked = badges.includes('chef-special');
        document.getElementById('badgeNew').checked = badges.includes('new');
    } else {
        title.innerHTML = '<i class="fas fa-plus-circle"></i> Add Menu Item';
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeMenuModal();
    });
}

function closeMenuModal() {
    const modal = document.getElementById('menuModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Save menu item
document.getElementById('menuForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveMenuItem();
});

async function saveMenuItem() {
    const id = document.getElementById('menuItemId').value;
    const badges = [];
    if (document.getElementById('badgeVeg').checked) badges.push('veg');
    if (document.getElementById('badgeSpicy').checked) badges.push('spicy');
    if (document.getElementById('badgeChef').checked) badges.push('chef-special');
    if (document.getElementById('badgeNew').checked) badges.push('new');

    const itemData = {
        name: document.getElementById('menuName').value.trim(),
        description: document.getElementById('menuDescription').value.trim(),
        price: parseFloat(document.getElementById('menuPrice').value) || 0,
        category: document.getElementById('menuCategory').value,
        image: document.getElementById('menuImage').value.trim(),
        badges,
        isAvailable: document.getElementById('menuAvailable').checked,
    };

    try {
        if (id) {
            // Update
            await api(`/api/menu/${id}`, { method: 'PATCH', body: itemData });
            showToast('Menu item updated! ✓', 'success');
        } else {
            // Create
            await api('/api/menu', { method: 'POST', body: itemData });
            showToast('Menu item added! 🍽️', 'success');
        }
        closeMenuModal();
        loadMenuItems();
        loadStats();
    } catch (err) {
        showToast('Failed to save menu item.', 'error');
    }
}

async function deleteMenuItem(id) {
    if (!confirm('Delete this menu item? This cannot be undone.')) return;

    try {
        await api(`/api/menu/${id}`, { method: 'DELETE' });
        showToast('Menu item deleted.', 'success');
        loadMenuItems();
        loadStats();
    } catch (err) {
        showToast('Failed to delete menu item.', 'error');
    }
}

async function toggleAvailability(id, currentState) {
    try {
        await api(`/api/menu/${id}`, {
            method: 'PATCH',
            body: { isAvailable: !currentState },
        });
        showToast(`Item marked as ${!currentState ? 'available' : 'unavailable'}.`, 'success');
        loadMenuItems();
    } catch (err) {
        showToast('Failed to update availability.', 'error');
        loadMenuItems(); // Revert UI
    }
}


/* ═══════════════════════════════════════════════════════════════
   TOAST NOTIFICATIONS
   ═══════════════════════════════════════════════════════════════ */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    
    const icons = {
        success: 'fa-circle-check',
        error: 'fa-circle-exclamation',
        info: 'fa-circle-info',
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info} toast-icon"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}


/* ═══════════════════════════════════════════════════════════════
   UTILITY FUNCTIONS
   ═══════════════════════════════════════════════════════════════ */
function formatDate(dateString, includeTime = false) {
    if (!dateString) return '—';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;

        const options = {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        };

        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }

        return date.toLocaleDateString('en-US', options);
    } catch {
        return dateString;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function getInitials(name) {
    return name
        .split(' ')
        .map(w => w.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
}


/* ═══════════════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener('keydown', (e) => {
    // Escape to close modal
    if (e.key === 'Escape') {
        closeMenuModal();
        closeSidebar();
    }
});


/* ═══════════════════════════════════════════════════════════════
   INITIALIZE
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});
