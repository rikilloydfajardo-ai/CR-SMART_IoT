/*
 * cleaning-dispatch.js — Cleaning Dispatch screen.
 *
 * The records below are EXAMPLES. New dispatches made with the
 * "Dispatch Cleaner Now" form only stay until the page is reloaded
 * (nothing is saved to a database yet).
 */

const CURRENT_USER = 'Johnny Guzon';

const dispatches = [
  {
    id: 'CD-0263', time: '02:20 PM', date: 'Oct 08, 2026',
    reason: 'Scheduled follow-up cleaning', staff: 'Mark Dela Cruz',
    urgency: 'Routine', status: 'Pending', chat: 0, chatNote: 'Awaiting acknowledgment',
  },
  {
    id: 'CD-0262', time: '12:50 PM', date: 'Oct 08, 2026',
    reason: 'Earlier NH₃ warning alert', staff: 'Ana Reyes',
    urgency: 'Moderate', status: 'In Progress', chat: 2, chatNote: 'Cleaner is on site',
  },
  {
    id: 'CD-0261', time: '12:22 PM', date: 'Oct 08, 2026',
    reason: 'Earlier critical odor buildup', staff: 'Luis Santos',
    urgency: 'High', status: 'Completed', chat: 0, chatNote: 'Cleaning verified · 12:45 PM',
  },
];

const URGENCY_PILL = { Routine: 'pill-gray', Moderate: 'pill-gold', High: 'pill-red' };
const STATUS_PILL = { Pending: 'pill-gold', 'In Progress': 'pill-blue', Completed: 'pill-green' };

let currentView = 'all';     // 'all' or 'mine'
let currentFilter = 'All';   // 'All', 'Pending', 'In Progress', 'Completed'

function rowHTML(d) {
  const chatCount = d.chat ? `<span class="chat-count">${d.chat}</span>` : '';
  return `
    <tr>
      <td><span class="task-id">${d.id}</span><span class="cell-sub">${d.time}</span><span class="cell-sub">${d.date}</span></td>
      <td><span class="cell-main">CEIT Male Comfort Room</span><span class="cell-sub">${d.reason}</span></td>
      <td><span class="cell-main">${d.staff}</span><span class="cell-sub">Custodial staff</span></td>
      <td><span class="cell-main">${CURRENT_USER}</span><span class="cell-sub">Super Administrator</span></td>
      <td><span class="pill ${URGENCY_PILL[d.urgency]}">${d.urgency}</span></td>
      <td><span class="pill ${STATUS_PILL[d.status]}" style="text-transform:none">${d.status}</span></td>
      <td><a href="#" class="chat-link" data-soon="Live chat"><i class="fa-regular fa-comments"></i> Open live chat ${chatCount}</a>
          <span class="cell-sub">${d.chatNote}</span></td>
      <td><button class="btn-light" data-details="${d.id}"><i class="fa-regular fa-eye"></i> View Details</button></td>
    </tr>`;
}

function renderTable() {
  const rows = dispatches.filter((d) => {
    const viewOk = currentView === 'all' || d.staff === CURRENT_USER;
    const filterOk = currentFilter === 'All' || d.status === currentFilter;
    return viewOk && filterOk;
  });

  const body = document.getElementById('dispatch-rows');
  body.innerHTML = rows.length
    ? rows.map(rowHTML).join('')
    : `<tr class="empty-row"><td colspan="8">${
        currentView === 'mine' ? 'No cleaning tasks are assigned to you.' : 'No dispatches match this filter.'
      }</td></tr>`;

  const active = dispatches.filter((d) => d.status !== 'Completed').length;
  document.getElementById('table-summary').textContent =
    `Showing ${rows.length} example dispatch${rows.length === 1 ? '' : 'es'} · ${active} active tasks`;
}

function openModal(open) {
  document.getElementById('dispatch-modal').classList.toggle('open', open);
  if (open) document.getElementById('reason').focus();
}

document.addEventListener('DOMContentLoaded', () => {
  renderTable();

  document.getElementById('view-tabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (!tab) return;
    currentView = tab.dataset.view;
    document.querySelectorAll('#view-tabs .tab').forEach((t) => t.classList.toggle('active', t === tab));
    renderTable();
  });

  document.getElementById('status-filter').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    currentFilter = btn.dataset.filter;
    document.querySelectorAll('#status-filter button').forEach((b) => b.classList.toggle('active', b === btn));
    renderTable();
  });

  document.getElementById('dispatch-rows').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-details]');
    if (!btn) return;
    const d = dispatches.find((x) => x.id === btn.dataset.details);
    showToast(`${d.id}: ${d.reason} — ${d.staff} (${d.status})`);
  });

  document.getElementById('open-dispatch').addEventListener('click', () => openModal(true));
  document.getElementById('cancel-dispatch').addEventListener('click', () => openModal(false));
  document.getElementById('dispatch-modal').addEventListener('click', (e) => {
    if (e.target.id === 'dispatch-modal') openModal(false);
  });

  document.getElementById('dispatch-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const reason = document.getElementById('reason').value.trim();
    if (!reason) {
      document.getElementById('dispatch-error').textContent = 'Please enter the reason for this dispatch.';
      return;
    }

    const lastNumber = Math.max(...dispatches.map((d) => Number(d.id.split('-')[1])));
    const now = new Date();
    dispatches.unshift({
      id: `CD-${String(lastNumber + 1).padStart(4, '0')}`,
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      reason,
      staff: document.getElementById('staff').value,
      urgency: document.getElementById('urgency').value,
      status: 'Pending', chat: 0, chatNote: 'Awaiting acknowledgment',
    });

    document.getElementById('dispatch-form').reset();
    document.getElementById('dispatch-error').textContent = '';
    openModal(false);
    renderTable();
    showToast('Dispatch created (demo only — not saved to a database yet).');
  });
});
