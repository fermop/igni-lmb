/* ui.js — Rendering functions for LMB Dashboard */

/* ─── Helpers ─────────────────────────────────────── */
function getSplit(team, type) {
  return team.records.splitRecords.find(r => r.type === type) ?? { wins: 0, losses: 0, pct: '.000' };
}

function pctBar(pct) {
  return (parseFloat(pct) * 100).toFixed(1);
}

function pctLabel(pct) {
  const n = parseFloat(pct);
  return isNaN(n) ? '—' : (n * 100).toFixed(1) + '%';
}

/* ─── Hero Header ─────────────────────────────────── */
function renderHeroHeader(team) {
  const isWin = team.streak.streakType === 'wins';
  const streakLabel = isWin ? `Racha ganadora: ${team.streak.streakCode}` : `Racha perdedora: ${team.streak.streakCode}`;
  const divLabel = team.divisionLeader ? '· Líder de División' : '';
  const zone = team.leagueRecord ? '' : '';

  // Find division name from divisionRecords
  const divRecords = team.records.divisionRecords;
  const divNorte = divRecords.find(d => d.division.name.includes('Norte'));
  const divSur   = divRecords.find(d => d.division.name.includes('Sur'));
  // We determine zone by whichever record is primary (higher games)
  const zoneText = divNorte && divSur
    ? (divNorte.wins + divNorte.losses >= divSur.wins + divSur.losses ? 'Zona Norte' : 'Zona Sur')
    : '';

  document.getElementById('hero-header').innerHTML = `
    <div class="hero-inner">
      <div class="hero-stitches"></div>
      <div class="hero-glow"></div>
      <div class="hero-top">
        <div class="hero-left">
          <h1 class="hero-name">${team.team.name}</h1>
          <p class="hero-meta">
            ${zoneText ? `<span>${zoneText}</span><span class="hero-meta-sep">·</span>` : ''}
            <span>Rank #${team.leagueRank} Liga</span>
            ${team.gamesBack !== '-' ? `<span class="hero-meta-sep">·</span><span>${team.gamesBack} JA</span>` : ''}
            ${divLabel ? `<span class="hero-meta-sep">${divLabel}</span>` : ''}
          </p>
        </div>
        <div class="hero-record">
          <div class="big-record">${team.wins}–${team.losses}</div>
          <div class="record-label">PCT ${team.leagueRecord.pct}</div>
        </div>
      </div>
      <div class="hero-bottom">
        <span class="streak-badge ${isWin ? 'win' : 'loss'}">
          <span class="streak-dot"></span>
          ${streakLabel}
        </span>
        <span class="hero-pct">${team.gamesPlayed} JJ</span>
      </div>
    </div>
  `;
}

/* ─── Last 10 Games ───────────────────────────────── */
function renderLastTen(team) {
  const lastTen = getSplit(team, 'lastTen');
  // Build W/L badge sequence: wins first, then losses
  const badges = [
    ...Array(lastTen.wins).fill('W'),
    ...Array(lastTen.losses).fill('L')
  ].map(r => `<span class="game-badge ${r.toLowerCase()}">${r}</span>`).join('');

  const total = lastTen.wins + lastTen.losses;

  document.getElementById('card-last-ten').innerHTML = `
    <div class="card-label">Últimos ${total} juegos</div>
    <div class="last-ten-badges">${badges}</div>
    <div class="last-ten-summary">${lastTen.wins}–${lastTen.losses} <span>en los últimos ${total} juegos</span></div>
  `;
}

/* ─── Run Differential ────────────────────────────── */
function renderRunDiff(team) {
  const diff = team.runDifferential;
  const sign = diff > 0 ? '+' : '';
  const cls  = diff >= 0 ? 'pos' : 'neg';

  document.getElementById('card-run-diff').innerHTML = `
    <div class="card-label">Diferencial de carreras</div>
    <div class="run-diff-number ${cls}">${sign}${diff}</div>
    <div class="run-diff-row">
      <div class="run-diff-stat">
        <span class="val scored">${team.runsScored}</span>
        <span class="lbl">Anotadas</span>
      </div>
      <div class="run-diff-stat">
        <span class="val allowed">${team.runsAllowed}</span>
        <span class="lbl">Permitidas</span>
      </div>
    </div>
  `;
}

/* ─── Home vs Away ────────────────────────────────── */
function renderHomeAway(team) {
  const home = getSplit(team, 'home');
  const away = getSplit(team, 'away');
  const divNorte = team.records.divisionRecords.find(d => d.division.name.includes('Norte'));
  const divSur   = team.records.divisionRecords.find(d => d.division.name.includes('Sur'));

  document.getElementById('card-home-away').innerHTML = `
    <div class="card-label">Casa vs Visitante</div>
    <div class="home-away-grid">
      <div class="split-block">
        <div class="split-type">🏠 Casa</div>
        <div class="split-record">${home.wins}–${home.losses}</div>
        <div class="split-pct">PCT ${home.pct}</div>
      </div>
      <div class="vs-sep">VS</div>
      <div class="split-block">
        <div class="split-type">✈️ Visitante</div>
        <div class="split-record">${away.wins}–${away.losses}</div>
        <div class="split-pct">PCT ${away.pct}</div>
      </div>
      <div class="home-away-bars">
        <div class="bar-row">
          <span class="bar-row-label">Casa</span>
          <div class="bar-track"><div class="bar-fill home" style="width:${pctBar(home.pct)}%"></div></div>
          <span class="bar-pct">${pctLabel(home.pct)}</span>
        </div>
        <div class="bar-row">
          <span class="bar-row-label">Visitante</span>
          <div class="bar-track"><div class="bar-fill away" style="width:${pctBar(away.pct)}%"></div></div>
          <span class="bar-pct">${pctLabel(away.pct)}</span>
        </div>
        ${divNorte ? `<div class="bar-row">
          <span class="bar-row-label">División</span>
          <div class="bar-track"><div class="bar-fill div" style="width:${pctBar(divNorte.pct)}%"></div></div>
          <span class="bar-pct">${pctLabel(divNorte.pct)}</span>
        </div>` : ''}
        ${divSur ? `<div class="bar-row">
          <span class="bar-row-label">Inter-zon.</span>
          <div class="bar-track"><div class="bar-fill inter" style="width:${pctBar(divSur.pct)}%"></div></div>
          <span class="bar-pct">${pctLabel(divSur.pct)}</span>
        </div>` : ''}
      </div>
    </div>
  `;
}

/* ─── Day vs Night ────────────────────────────────── */
function renderDayNight(team) {
  const day   = getSplit(team, 'day');
  const night = getSplit(team, 'night');
  const dayGames   = day.wins + day.losses;
  const nightGames = night.wins + night.losses;

  document.getElementById('card-day-night').innerHTML = `
    <div class="card-label">Día vs Noche</div>
    <div class="day-night-cols">
      <div class="dn-block day">
        <div class="dn-icon-label">☀️ Día</div>
        <div class="dn-record">${day.wins}–${day.losses}</div>
        <div class="dn-pct">PCT ${day.pct}</div>
        ${dayGames > 0 ? `<div class="dn-games">${dayGames} juegos</div>` : ''}
      </div>
      <div class="dn-block night">
        <div class="dn-icon-label">🌙 Noche</div>
        <div class="dn-record">${night.wins}–${night.losses}</div>
        <div class="dn-pct">PCT ${night.pct}</div>
        ${nightGames > 0 ? `<div class="dn-games">${nightGames} juegos</div>` : ''}
      </div>
    </div>
  `;
}

/* ─── Pressure Situations ─────────────────────────── */
function renderPressure(team) {
  const oneRun  = getSplit(team, 'oneRun');
  const extra   = getSplit(team, 'extraInning');
  const oneRunGames = oneRun.wins + oneRun.losses;
  const extraGames  = extra.wins + extra.losses;

  document.getElementById('card-pressure').innerHTML = `
    <div class="card-label">Situaciones de presión</div>
    <div class="pressure-cols">
      <div class="pressure-block">
        <div class="p-label">⚡ 1 carrera</div>
        <div class="p-record">${oneRun.wins}–${oneRun.losses}</div>
        <div class="p-pct">PCT ${oneRun.pct}</div>
        ${oneRunGames > 0 ? `<div class="p-games">${oneRunGames} juegos cerrados</div>` : ''}
      </div>
      <div class="pressure-block">
        <div class="p-label">🔵 Extra innings</div>
        <div class="p-record">${extra.wins}–${extra.losses}</div>
        <div class="p-pct">PCT ${extra.pct}</div>
        ${extraGames > 0 ? `<div class="p-games">${extraGames} juegos extendidos</div>` : ''}
      </div>
    </div>
  `;
}

/* ─── Season Context ──────────────────────────────── */
function renderSeasonContext(team) {
  const magic = team.magicNumber ?? null;
  const elim  = team.eliminationNumber ?? null;
  const gb    = team.gamesBack;

  document.getElementById('card-season-context').innerHTML = `
    <div class="card-label">Contexto de temporada</div>
    <div class="season-cols">
      <div class="ctx-block">
        <div class="ctx-val">${team.gamesPlayed}</div>
        <div class="ctx-lbl">Juegos jugados</div>
      </div>
      <div class="ctx-block">
        <div class="ctx-val ${gb === '-' ? 'dash' : ''}">${gb === '-' ? '—' : gb}</div>
        <div class="ctx-lbl">Juegos atrás</div>
      </div>
      <div class="ctx-block">
        <div class="ctx-val ${magic ? 'magic' : 'dash'}">${magic ?? '—'}</div>
        <div class="ctx-lbl">Número mágico</div>
      </div>
      <div class="ctx-block">
        <div class="ctx-val ${elim && elim !== '-' ? 'elim' : 'dash'}">${elim && elim !== '-' ? elim : '—'}</div>
        <div class="ctx-lbl">Núm. eliminación</div>
      </div>
    </div>
  `;
}

/* ─── Export entry point ──────────────────────────── */
export function renderAll(team) {
  renderHeroHeader(team);
  renderLastTen(team);
  renderRunDiff(team);
  renderHomeAway(team);
  renderDayNight(team);
  renderPressure(team);
  renderSeasonContext(team);
}

// Keep legacy exports so nothing breaks if referenced elsewhere
export { renderHeroHeader };
export function renderDayNightCard(team) { renderDayNight(team); }