import { useTranslation } from "react-i18next";

function getProjectStats(entries, projectId) {
  const projectEntries = entries.filter((e) => e.projectId === projectId);
  const minutes = projectEntries.reduce(
    (sum, e) => sum + (e.durationMinutes || 0),
    0
  );
  return { minutes, count: projectEntries.length };
}

export default function ProjectCard({ project, entries, onSelect }) {
  const { t } = useTranslation();
  const { minutes, count } = getProjectStats(entries, project.id);
  const hours = (minutes / 60).toFixed(1);

  return (
    <button
      type="button"
      onClick={() => onSelect(project.id)}
      className="group text-left bg-slate-900 border border-slate-800 rounded-lg p-5 hover:border-slate-700 hover:bg-slate-900/80 transition-colors flex flex-col gap-3"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: project.color }}
          />
          <h3 className="text-slate-100 font-semibold truncate">
            {project.name}
          </h3>
        </div>
        <span className="font-mono text-xs text-slate-600 group-hover:text-slate-400 transition-colors shrink-0">
          →
        </span>
      </div>

      <p className="text-sm text-slate-400 line-clamp-2 min-h-[2.5rem]">
        {project.description || t("projectCard.noDescription")}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-slate-800 mt-auto">
        <span className="font-mono text-xs text-slate-500">
          {t("projectCard.entry", { count })}
        </span>
        <span
          className="font-mono text-sm font-semibold"
          style={{ color: project.color }}
        >
          {hours}h
        </span>
      </div>
    </button>
  );
}
