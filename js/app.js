import { getLMBData } from './api.js';
import { renderAll } from './ui.js';

let allTeams = [];
let zoneNorteTeams = [];
let zoneSurTeams = [];
let selectedTeamId = 5010; // Toros por defecto

async function init() {
  const records = await getLMBData();
  if (!records) {
    document.getElementById('loading-screen').classList.add('hidden');
    document.getElementById('dashboard').innerHTML =
      '<p style="text-align:center;padding:60px 20px;color:#7a7a86;font-family:Barlow,sans-serif;">No se pudieron cargar los datos. Intenta recargar la página.</p>';
    return;
  }

  // records[0] = Zona Norte, records[1] = Zona Sur
  zoneNorteTeams = records[0]?.teamRecords ?? [];
  zoneSurTeams   = records[1]?.teamRecords ?? [];
  allTeams = [...zoneNorteTeams, ...zoneSurTeams];

  renderNavbar();
  updateDashboard();

  document.getElementById('loading-screen').classList.add('hidden');
}

function renderNavbar() {
  const renderButtons = (teams, containerId) => {
    const container = document.getElementById(containerId);
    container.innerHTML = teams.map(team => `
      <button
        id="btn-team-${team.team.id}"
        class="team-btn${team.team.id === selectedTeamId ? ' active' : ''}"
        data-id="${team.team.id}"
        aria-pressed="${team.team.id === selectedTeamId}"
      >${team.team.name}</button>
    `).join('');
  };

  renderButtons(zoneNorteTeams, 'zone-norte');
  renderButtons(zoneSurTeams,   'zone-sur');

  document.getElementById('team-selector').addEventListener('click', (e) => {
    const btn = e.target.closest('.team-btn');
    if (!btn) return;
    selectedTeamId = parseInt(btn.dataset.id);
    // Update active state
    document.querySelectorAll('.team-btn').forEach(b => {
      const isActive = parseInt(b.dataset.id) === selectedTeamId;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-pressed', isActive);
    });
    updateDashboard();
  }, { once: false });
}

function updateDashboard() {
  const team = allTeams.find(t => t.team.id === selectedTeamId);
  if (!team) return;
  renderAll(team);
}

function initTheme() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  // Sync aria-pressed with current theme on load
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  btn.setAttribute('aria-pressed', current === 'light');

  btn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('lmb-theme', next);
    btn.setAttribute('aria-pressed', next === 'light');
  });
}

init();
initTheme();