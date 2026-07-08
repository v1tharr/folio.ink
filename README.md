[![en](https://img.shields.io/badge/lang-en-red.svg)](README.md)
[![ru](https://img.shields.io/badge/lang-ru-blue.svg)](README.ru.md)

# folio.ink

A local desktop developer journal. Track projects, log daily entries, and view time spent statistics. All data is stored locally in SQLite.

> **Status:** early MVP, active development.

## Stack

| Layer | Technology |
|---|---|
| Desktop shell | Tauri v2 (Rust) |
| Frontend | React + Vite + Tailwind CSS |
| Backend | Python + Flask + SQLAlchemy |
| Database | SQLite (local file) |
| CI/CD | GitHub Actions + PyInstaller |

## Screens

1. **Projects** — list view: name, color, description
2. **Entries** — timeline by date, time spent, what was done (Markdown)
3. **Stats** — hours per project, weekly/monthly breakdown, charts

## Out of scope for MVP

Cloud sync, authentication, custom themes, export, mobile version — planned for later phases, not part of the initial release.

## Running locally

### Backend

```bash
cd backend
pip install -r requirements.txt
python run.py