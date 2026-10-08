/*
 * layout.js — builds the parts that every screen shares:
 * the title bar, header, sidebar menu and footer.
 *
 * Each page only needs:
 *   <body data-page="home">            (home | ai-monitoring | dispatch | login)
 *   <div id="app-header"></div>
 *   <aside id="app-sidebar"></aside>   (not on the login page)
 *   <div id="app-footer"></div>
 */

const SYSTEM_TITLE =
  'AI-Enabled IoT Odor Monitoring System with Predictive Data Analytics for the CEIT Male Restroom at CSUCC';

// Screens that are already implemented link to real pages.
// The others are planned and show a "coming soon" message.
const MENU = [
  { section: 'MAIN NAVIGATION' },
  { id: 'home', label: 'Home', icon: 'fa-house', href: 'index.html' },
  { id: 'ai-monitoring', label: 'AI Monitoring', icon: 'fa-brain', href: 'ai-monitoring.html' },
  { id: 'dispatch', label: 'Cleaning Dispatch', icon: 'fa-broom', href: 'cleaning-dispatch.html', badge: 2 },
  { section: 'GOVERNANCE' },
  { id: 'approvals', label: 'Approvals', icon: 'fa-user-check' },
  { id: 'users', label: 'Manage Users', icon: 'fa-users-gear' },
  { id: 'privileges', label: 'Manage Privileges', icon: 'fa-user-shield' },
  { id: 'logs', label: 'Activity Logs', icon: 'fa-clock-rotate-left' },
  { id: 'super-admins', label: 'Super Administrators', icon: 'fa-user-tie', crown: true },
  { section: 'ACCOUNT & SESSION' },
  { id: 'settings', label: 'My Account / Settings', icon: 'fa-user-gear' },
  { id: 'logout', label: 'Log Out', icon: 'fa-right-from-bracket', href: 'login.html', logout: true },
];

function brandHTML() {
  return `
    <a class="brand" href="index.html">
      <img src="assets/logo.png" alt="CSUCC seal">
      <span>
        <span class="brand-name">CR-SMART</span>
        <span class="brand-sub">CSUCC IoT Monitoring</span>
      </span>
    </a>`;
}

function buildHeader(isLogin) {
  const right = isLogin
    ? `<a class="header-link" href="index.html">Home</a>
       <a class="btn-orange" href="#" data-soon="Registration">Register</a>`
    : `<div class="user-pill">
         <span class="dot"></span>
         <span class="name">Johnny Guzon</span>
         <span class="avatar">JG</span>
         <span class="role-badge">SUPER ADMIN</span>
       </div>
       <a class="btn-outline-light" href="login.html"><i class="fa-solid fa-right-from-bracket"></i> Log-out</a>`;

  const menuButton = isLogin
    ? ''
    : `<button class="btn-outline-light" id="menu-toggle"><i class="fa-solid fa-bars"></i> Menu</button>`;

  return `
    <div class="title-bar">${SYSTEM_TITLE}</div>
    <header class="site-header">
      <div class="header-left">${menuButton}${brandHTML()}</div>
      <div class="header-right">${right}</div>
    </header>`;
}

function buildSidebar(activePage) {
  let items = '';
  for (const item of MENU) {
    if (item.section) {
      items += `</ul><div class="sidebar-section">${item.section}</div><ul class="sidebar-menu">`;
      continue;
    }
    const classes = ['sidebar-link'];
    if (item.id === activePage) classes.push('active');
    if (item.logout) classes.push('logout');
    const href = item.href || '#';
    const soon = item.href ? '' : ` data-soon="${item.label}"`;
    const extra = item.badge
      ? `<span class="nav-badge">${item.badge}</span>`
      : item.crown ? `<i class="fa-solid fa-crown nav-crown"></i>` : '';
    items += `<li><a class="${classes.join(' ')}" href="${href}"${soon}>
                <i class="fa-solid ${item.icon}"></i><span>${item.label}</span>${extra}</a></li>`;
  }

  return `
    <div class="sidebar-head">
      <img src="assets/logo.png" alt="">
      <div class="who"><strong>CR-SMART MENU</strong><span>Johnny Guzon</span></div>
      <span class="avatar">JG</span>
    </div>
    <ul class="sidebar-menu">${items}</ul>
    <div class="sidebar-foot"><span class="dot"></span> CSUCC CR-SMART Online</div>`;
}

function buildFooter() {
  return `
    <footer class="site-footer">
      <div class="footer-brand">
        <img src="assets/logo.png" alt="">
        <div><strong>CR-SMART MONITORING SYSTEM</strong><span>Caraga State University – Cabadbaran City Campus</span></div>
      </div>
      <div class="footer-right">
        <div><span class="dot"></span> System Active · Real-Time Security Enabled</div>
        <div>© 2026 CR-SMART CSUCC. All Rights Reserved.</div>
      </div>
    </footer>`;
}

/* Small pop-up message at the bottom of the screen. */
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2500);
}

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  const isLogin = page === 'login';

  document.getElementById('app-header').innerHTML = buildHeader(isLogin);
  document.getElementById('app-footer').innerHTML = buildFooter();

  const sidebar = document.getElementById('app-sidebar');
  if (sidebar) {
    sidebar.className = 'sidebar';
    sidebar.innerHTML = buildSidebar(page);
    document.getElementById('menu-toggle').addEventListener('click', () => {
      // Desktop: collapse the sidebar. Small screens: slide it in and out.
      if (window.innerWidth <= 860) sidebar.classList.toggle('open');
      else sidebar.classList.toggle('collapsed');
    });
  }

  // Menu items that are not built yet.
  document.addEventListener('click', (event) => {
    const link = event.target.closest('[data-soon]');
    if (!link) return;
    event.preventDefault();
    showToast(`${link.dataset.soon} — planned, not yet implemented in this prototype.`);
  });
});
