const API = '/api';
async function api(path, options = {}) { const response = await fetch(API + path, { credentials: 'include', ...options }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.message || 'Something went wrong.'); return data; }
function showMessage(message, target = '#message') { const element = document.querySelector(target); if (element) { element.textContent = message; element.style.display = 'block'; } }
function statusBadge(status) { return `<span class="status ${status.replaceAll(' ', '-')}">${status}</span>`; }
function isComplaintOverdue(complaint) {
  if (!complaint || !complaint.due_date) return false;
  const due = new Date(`${complaint.due_date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today && !['Resolved', 'Rejected', 'Closed'].includes(complaint.status);
}
function overdueAlertMessage(complaints) {
  const overdue = complaints.filter(isComplaintOverdue);
  if (!overdue.length) return '';
  return `<div class="message" style="display:block; margin-bottom:18px; background:#fff4f1; border:1px solid #d66161; color:#7a1d18;">${overdue.length === 1 ? 'One complaint missed its due date and still needs a response.' : `${overdue.length} complaints missed their due dates and still need a response.`}</div>`;
}
function nav(user) { return `<header class="topbar"><a class="brand" href="/"><span class="brand-mark">CC</span> Campus Care</a><nav class="nav">${user ? `<a href="${user.role === 'admin' ? '/admin-dashboard.html' : '/student-dashboard.html'}">Dashboard</a><a href="#" id="logout">Log out</a>` : '<a href="/login.html">Student login</a><a class="btn" href="/register.html">Register</a>'}</nav></header>`; }
async function logout() { await api('/auth/logout', { method: 'POST' }); location.href = '/'; }
async function currentUser() { const { user } = await api('/auth/me'); return user; }
function requireRole(role) { return currentUser().then(user => { if (!user || user.role !== role) { location.href = role === 'admin' ? '/admin-login.html' : '/login.html'; return null; } document.body.insertAdjacentHTML('afterbegin', nav(user)); document.querySelector('#logout')?.addEventListener('click', e => { e.preventDefault(); logout(); }); return user; }).catch(() => { location.href = '/login.html'; }); }
function side(active, role = 'student') { const links = role === 'admin' ? [['admin-dashboard.html','Overview'],['admin-dashboard.html','All complaints']] : [['student-dashboard.html','Overview'],['complaints.html','My complaints'],['submit-complaint.html','Submit complaint']]; return `<aside class="sidebar"><div class="side-label">Workspace</div>${links.map(([href,label]) => `<a class="side-link ${active === label ? 'active' : ''}" href="/${href}">${label}</a>`).join('')}<div class="side-label">Account</div><a class="side-link" href="/">Back to home</a></aside>`; }
