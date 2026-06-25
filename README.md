# LMB Dashboard

A real-time statistics dashboard for the Liga Mexicana de Béisbol (LMB) 2026 season. Built with vanilla JavaScript and CSS — no frameworks, no bundler, no build step.

## Overview

This project consumes the official MLB Stats API to display live standings and team performance data for all LMB franchises. The interface is designed to feel like a sports experience, not a data table: warm night-game palette, scoreboard-style typography, and a layout that scales from mobile to desktop.

The data is read-only and fetched directly from the public endpoint on page load. No authentication, no server, no database.

## Features

- Live standings data from the MLB Stats API (leagueId 125, season 2026)
- Team selector organized by division (Zona Norte / Zona Sur) with horizontal scroll on mobile
- Per-team dashboard with six stat cards: last 10 games, run differential, home vs. away splits, day vs. night splits, high-pressure situations, and season context
- Light and dark mode with system preference detection and localStorage persistence
- Mobile-first responsive layout (single column on small screens, two-column grid on desktop)
- No external dependencies beyond Lucide for icons (loaded via CDN)

## Tech Stack

| Concern        | Choice                          |
|----------------|---------------------------------|
| Markup         | HTML5 (semantic elements)       |
| Styling        | Vanilla CSS (custom properties) |
| Logic          | Vanilla JavaScript (ES modules) |
| Icons          | Lucide (UMD, via unpkg CDN)     |
| Data           | MLB Stats API (public, no auth) |
| Fonts          | Google Fonts (Barlow Condensed, Barlow, Inter) |

## Project Structure

```
igni-mlb/
├── index.html          # Application shell and static markup
├── css/
│   └── styles.css      # Design tokens, component styles, responsive overrides
└── js/
    ├── api.js          # Data fetching — single fetch, single responsibility
    ├── app.js          # Initialization, state, event delegation, theme toggle
    └── ui.js           # Rendering engine — one function per dashboard section
```

### Module responsibilities

**`api.js`** — Owns the network layer. Exports a single async function `getLMBData()` that fetches from the MLB Stats API and returns the raw `records` array, or `null` on failure.

**`app.js`** — Entry point. Calls `getLMBData()`, splits teams by division, renders the navigation, and delegates all click events from the team selector to `updateDashboard()`. Also handles theme initialization and persistence.

**`ui.js`** — Rendering functions for each card section. The exported `renderAll(team)` function calls every renderer in sequence and re-processes Lucide icons after updating the DOM. Each renderer reads only the fields it needs from the API response and skips rendering if the data is missing.

## Data Source

**Endpoint:** `https://statsapi.mlb.com/api/v1/standings?leagueId=125&season=2026`

The API returns an array of `records` objects, one per division. Each record contains a `teamRecords` array with the following fields used by this dashboard:

| Field | Used for |
|---|---|
| `team.name`, `team.id` | Team identity and navigation |
| `wins`, `losses`, `gamesPlayed` | Hero section record display |
| `leagueRecord.pct` | Win percentage |
| `leagueRank`, `gamesBack` | League position metadata |
| `streak.streakType`, `streak.streakCode` | Current win/loss streak badge |
| `divisionLeader` | Division leader label |
| `runDifferential`, `runsScored`, `runsAllowed` | Run differential card |
| `records.splitRecords` | All split stats (home, away, day, night, lastTen, oneRun, extraInning) |
| `records.divisionRecords` | Division-specific win percentages for bar chart |
| `magicNumber`, `eliminationNumber` | Season context card (conditionally rendered) |

Fields absent from the API response are never rendered. There are no placeholder values.

## Design Decisions

**Mobile-first CSS.** Base styles target mobile layouts. The single `@media (min-width: 701px)` block overrides layout properties for larger screens. No `max-width` breakpoints.

**Two-row navigation on mobile.** The team selector splits into two independent horizontal scroll rails — one per division — so both Zona Norte and Zona Sur are immediately visible without having to scroll to the right.

**Theme without flash.** An inline `<script>` in `<head>` reads `localStorage` and `prefers-color-scheme` before the first paint, then sets `data-theme` on the `<html>` element. This prevents the white-flash-on-dark-mode problem common in JS-driven theming.

**Icon toggle via wrapper spans.** Lucide's `createIcons()` replaces `<i>` elements with `<svg>` elements and may alter how CSS `display` cascades. Wrapping each icon in a `<span class="icon-wrap">` and toggling `display` on the span (which Lucide never touches) is reliable across all browsers.

**Conditional rendering.** If the API does not return `magicNumber` or `eliminationNumber` for a team, those fields are rendered as an em dash rather than a misleading zero. The streak badge, games-back label, and division leader label are each omitted entirely when their data is absent.

## Running Locally

This project has no build step. Open `index.html` directly in a browser, or serve it with any static file server:

```bash
# Node.js (npx)
npx serve .
```

The MLB Stats API is public and does not require an API key. CORS is open for browser requests.

## Browser Support

Targets modern browsers (Chrome, Firefox, Safari, Edge — last two major versions). Relies on CSS custom properties, `@media (min-width)`, ES module `import/export`, and the Fetch API. No polyfills are included.

## Commit History

Follows the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat` — new user-facing functionality
- `fix` — bug corrections
- `style` — visual/CSS changes with no logic change
- `refactor` — code restructuring with no behavior change
- `docs` — documentation only