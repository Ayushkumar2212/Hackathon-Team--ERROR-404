// =====================================================
//   SafeScript AI — Global Shared JavaScript Utilities
// =====================================================

'use strict';

// ---- Auth Guard ----
// Call on every dashboard page to ensure a session exists
function requireAuth() {
    const user = getUser();
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    return user;
}

// ---- User Session Helpers ----
function getUser() {
    try {
        return JSON.parse(localStorage.getItem('safescript_user')) || null;
    } catch (e) {
        return null;
    }
}

function setUser(data) {
    localStorage.setItem('safescript_user', JSON.stringify(data));
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = 'logout.html';
    }
}

// ---- localStorage Helpers ----
function getData(key, fallback = []) {
    try {
        return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (e) {
        return fallback;
    }
}

function setData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// ---- Date / Time Helpers ----
function formatDate(date = new Date()) {
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(date = new Date()) {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function generateId(prefix = 'SS') {
    return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// ---- GPS Geolocation Helper ----
function getCurrentLocation(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => callback({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            err => { console.warn('GPS unavailable:', err); callback(null); }
        );
    } else {
        callback(null);
    }
}

function embedMap(iframeId, lat, lon, zoom = 14) {
    const iframe = document.getElementById(iframeId);
    if (iframe) {
        iframe.src = `https://maps.google.com/maps?q=${lat},${lon}&z=${zoom}&output=embed`;
    }
}

// ---- Tab Switcher ----
function switchTab(tabId, activeEl) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active-tab'));
    const target = document.getElementById(tabId);
    if (target) target.classList.add('active-tab');

    document.querySelectorAll('.sidebar-item').forEach(btn => btn.classList.remove('active'));
    if (activeEl) activeEl.classList.add('active');
}

// ---- Modal Helpers ----
function openModal(id) {
    const m = document.getElementById(id);
    if (m) m.style.display = 'flex';
}

function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.style.display = 'none';
}

// ---- Toast Notification ----
function showToast(message, type = 'success') {
    const colors = {
        success: 'bg-emerald-600',
        error:   'bg-rose-600',
        info:    'bg-blue-600',
        warning: 'bg-amber-500'
    };
    const toast = document.createElement('div');
    toast.className = `fixed bottom-6 right-6 z-[9999] px-6 py-4 rounded-2xl text-white font-bold text-sm shadow-2xl ${colors[type]} transition-all`;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// ---- Format Currency ----
function formatINR(amount) {
    return '₹' + parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

// ---- SOS Queue Helpers ----
function getSosQueue() {
    return getData('safescript_sos_queue', []);
}

function getPendingSosCount() {
    return getSosQueue().filter(s => s.status === 'Pending').length;
}

// ---- Appointment Helpers ----
function getAppointments() {
    return getData('safescript_appointments', []);
}

function isSlotTaken(date, time, type) {
    return getAppointments().some(a => a.date === date && a.time === time && a.type === type);
}

// ---- Export for inline HTML script tags ----
// All functions are global (no module system needed for this static site)
