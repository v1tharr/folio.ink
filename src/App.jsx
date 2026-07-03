import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import "./i18n";
import SideBar from "./components/SideBar";
import ProjectCard from "./components/ProjectCard";
import LogEditor from "./components/LogEditor";

const PROJECTS_KEY = "devlog_projects";
const ENTRIES_KEY = "devlog_entries";

const COLOR_PRESETS = [
  "#2dd4bf", // teal
  "#818cf8", // indigo
  "#f472b6", // pink
  "#fb923c", // orange
  "#4ade80", // green
  "#facc15", // yellow
  "#38bdf8", // sky
  "#f87171", // red
];

function isoDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function buildMockData() {
  const projects = [
    {
      id: "proj-devlog",
      name: "DevLog",
      description: "Local-first developer diary, React + Vite + Tailwind.",
      color: COLOR_PRESETS[0],
    },
    {
      id: "proj-api",
      name: "Billing API",
      description: "Internal billing microservice, Node + Postgres.",
      color: COLOR_PRESETS[1],
    },
    {
      id: "proj-side",
      name: "Terminal Portfolio",
      description: "Personal site styled like a shell prompt.",
      color: COLOR_PRESETS[3],
    },
  ];

  const entries = [
    {
      id: "e1",
      projectId: "proj-devlog",
      date: isoDaysAgo(0),
      durationMinutes: 90,
      text:
        "Scaffolded the **Sidebar** and **ProjectCard** components. Wired up `localStorage` persistence with a lazy `useState` initializer.\n\n- Nav highlights active screen\n- Logs tab disabled until a project is selected",
      tags: ["setup", "react"],
    },
    {
      id: "e2",
      projectId: "proj-devlog",
      date: isoDaysAgo(2),
      durationMinutes: 45,
      text:
        "Sketched the data model for `Project` and `Entry`. Decided against a backend for v1 — everything stays in `localStorage` so the app works fully offline.",
      tags: ["planning"],
    },
    {
      id: "e3",
      projectId: "proj-devlog",
      date: isoDaysAgo(6),
      durationMinutes: 120,
      text:
        "Built the markdown-lite renderer for entry notes. Supports `**bold**`, `*italic*`, inline `code`, and fenced ```blocks```.",
      tags: ["markdown", "editor"],
    },
    {
      id: "e4",
      projectId: "proj-api",
      date: isoDaysAgo(1),
      durationMinutes: 75,
      text:
        "Debugged a race condition in the invoice webhook handler. Root cause was a missing `await` on the idempotency check.",
      tags: ["bugfix", "webhooks"],
    },
    {
      id: "e5",
      projectId: "proj-api",
      date: isoDaysAgo(4),
      durationMinutes: 60,
      text:
        "Added retry logic with exponential backoff for the payment gateway client. Wrote unit tests for the backoff calculator.",
      tags: ["reliability", "tests"],
    },
    {
      id: "e6",
      projectId: "proj-api",
      date: isoDaysAgo(9),
      durationMinutes: 50,
      text: "Migrated the `invoices` table to add a `currency` column.",
      tags: ["migration"],
    },
    {
      id: "e7",
      projectId: "proj-side",
      date: isoDaysAgo(3),
      durationMinutes: 30,
      text:
        "Prototyped a boot-sequence animation for the landing page using CSS keyframes only, no JS.",
      tags: ["css", "animation"],
    },
    {
      id: "e8",
      projectId: "proj-side",
      date: isoDaysAgo(11),
      durationMinutes: 40,
      text: "Set up the project repo and deployed a placeholder page.",
      tags: ["setup"],
    },
  ];

  return { projects, entries };
}

function loadFromStorage(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const { t } = useTranslation();
  const mock = useMemo(buildMockData, []);

  const [projects, setProjects] = useState(() =>
    loadFromStorage(PROJECTS_KEY, mock.projects)
  );
  const [entries, setEntries] = useState(() =>
    loadFromStorage(ENTRIES_KEY, mock.entries)
  );

  const [screen, setScreen] = useState("projects");
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    window.localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  }, [entries]);

  const activeProject = projects.find((p) => p.id === activeProjectId) || null;
  const projectEntries = entries.filter((e) => e.projectId === activeProjectId);

  function handleSelectProject(id) {
    setActiveProjectId(id);
    setScreen("logs");
  }

  function handleAddProject(project) {
    setProjects((prev) => [...prev, project]);
    setShowNewProjectModal(false);
  }

  function handleSaveEntry(entry) {
    setEntries((prev) => [...prev, entry]);
  }

  return (
    <div className="h-screen w-screen flex bg-slate-950 text-slate-200 overflow-hidden">
      <SideBar
        screen={screen}
        setScreen={setScreen}
        activeProjectId={activeProjectId}
      />

      <main className="flex-1 min-w-0 h-screen overflow-hidden">
        {screen === "projects" && (
          <ProjectsScreen
            projects={projects}
            entries={entries}
            onSelect={handleSelectProject}
            onOpenModal={() => setShowNewProjectModal(true)}
          />
        )}

        {screen === "logs" && activeProject && (
          <LogEditor
            activeProject={activeProject}
            projectEntries={projectEntries}
            onSaveEntry={handleSaveEntry}
          />
        )}

        {screen === "logs" && !activeProject && (
          <div className="h-screen flex items-center justify-center">
            <p className="text-slate-600 text-sm">
              {t("logsScreen.selectFirst")}
            </p>
          </div>
        )}

        {screen === "stats" && (
          <StatsScreen projects={projects} entries={entries} />
        )}
      </main>

      {showNewProjectModal && (
        <NewProjectModal
          onClose={() => setShowNewProjectModal(false)}
          onCreate={handleAddProject}
        />
      )}
    </div>
  );
}

function ProjectsScreen({ projects, entries, onSelect, onOpenModal }) {
  const { t } = useTranslation();
  return (
    <div className="h-screen overflow-y-auto px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">
            {t("projectsScreen.header")}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {t("projectsScreen.tracked", { count: projects.length })}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenModal}
          className="px-4 py-2 rounded-md bg-teal-500 hover:bg-teal-400 text-slate-950 text-sm font-semibold transition-colors"
        >
          {t("projectsScreen.newProject")}
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="border border-dashed border-slate-800 rounded-lg py-16 text-center">
          <p className="text-slate-500 text-sm">
            {t("projectsScreen.emptyState")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              entries={entries}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NewProjectModal({ onClose, onCreate }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLOR_PRESETS[0]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `proj-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      color,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">
          {t("modal.title")}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              {t("modal.nameLabel")}
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("modal.namePlaceholder")}
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              {t("modal.descriptionLabel")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("modal.descriptionPlaceholder")}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-2">
              {t("modal.colorLabel")}
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c
                      ? "ring-2 ring-offset-2 ring-offset-slate-900 ring-slate-200 scale-110"
                      : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Choose color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-md border border-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              {t("modal.cancel")}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-md bg-teal-500 hover:bg-teal-400 text-slate-950 text-sm font-semibold transition-colors"
            >
              {t("modal.create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // week starts Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function StatsScreen({ projects, entries }) {
  const { t } = useTranslation();
  const now = new Date();
  const weekStart = startOfWeek(now);

  const minutesThisWeek = entries
    .filter((e) => new Date(`${e.date}T00:00:00`) >= weekStart)
    .reduce((sum, e) => sum + (e.durationMinutes || 0), 0);

  const totalMinutes = entries.reduce(
    (sum, e) => sum + (e.durationMinutes || 0),
    0
  );

  const perProject = projects
    .map((project) => {
      const minutes = entries
        .filter((e) => e.projectId === project.id)
        .reduce((sum, e) => sum + (e.durationMinutes || 0), 0);
      return { project, minutes };
    })
    .sort((a, b) => b.minutes - a.minutes);

  // Activity grid: last 12 weeks, Mon-Sun columns per week
  const DAYS = 84;
  const gridStart = new Date(now);
  gridStart.setDate(gridStart.getDate() - (DAYS - 1));
  const alignedStart = startOfWeek(gridStart);

  const minutesByDate = {};
  entries.forEach((e) => {
    minutesByDate[e.date] = (minutesByDate[e.date] || 0) + (e.durationMinutes || 0);
  });

  const weeks = [];
  let cursor = new Date(alignedStart);
  while (cursor <= now) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const iso = cursor.toISOString().slice(0, 10);
      week.push({ date: iso, minutes: minutesByDate[iso] || 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  function intensityClass(minutes) {
    if (minutes === 0) return "bg-slate-900";
    if (minutes < 30) return "bg-teal-950";
    if (minutes < 60) return "bg-teal-800";
    if (minutes < 120) return "bg-teal-600";
    return "bg-teal-400";
  }

  return (
    <div className="h-screen overflow-y-auto px-8 py-6">
      <h2 className="text-xl font-semibold text-slate-100 mb-6">
        {t("stats.header")}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label={t("stats.thisWeek")}
          value={`${(minutesThisWeek / 60).toFixed(1)}h`}
        />
        <StatCard
          label={t("stats.allTime")}
          value={`${(totalMinutes / 60).toFixed(1)}h`}
        />
        <StatCard label={t("stats.totalEntries")} value={String(entries.length)} />
      </div>

      <section className="mb-8">
        <h3 className="font-mono text-xs uppercase tracking-wider text-slate-500 mb-4">
          {t("stats.timeByProject")}
        </h3>
        {perProject.length === 0 ? (
          <p className="text-sm text-slate-600 italic">{t("stats.noData")}</p>
        ) : (
          <div className="space-y-3">
            {perProject.map(({ project, minutes }) => {
              const pct = totalMinutes ? (minutes / totalMinutes) * 100 : 0;
              return (
                <div key={project.id}>
                  <div className="flex items-center justify-between mb-1 text-sm">
                    <span className="text-slate-300 flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      {project.name}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      {(minutes / 60).toFixed(1)}h
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: project.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="pb-8">
        <h3 className="font-mono text-xs uppercase tracking-wider text-slate-500 mb-4">
          {t("stats.activityHeader")}
        </h3>
        <div className="flex gap-1 overflow-x-auto pb-2">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day) => (
                <div
                  key={day.date}
                  title={`${day.date} · ${day.minutes}m`}
                  className={`w-3 h-3 rounded-sm ${intensityClass(day.minutes)}`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-600 font-mono">
          <span>{t("stats.less")}</span>
          <span className="w-3 h-3 rounded-sm bg-slate-900" />
          <span className="w-3 h-3 rounded-sm bg-teal-950" />
          <span className="w-3 h-3 rounded-sm bg-teal-800" />
          <span className="w-3 h-3 rounded-sm bg-teal-600" />
          <span className="w-3 h-3 rounded-sm bg-teal-400" />
          <span>{t("stats.more")}</span>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="font-mono text-2xl font-semibold text-slate-100">
        {value}
      </p>
    </div>
  );
}
