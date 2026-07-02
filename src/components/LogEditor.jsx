import { useState } from "react";
import { useTranslation } from "react-i18next";

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Minimal markdown-ish renderer: bold, italic, inline code, code blocks,
// headings, bullet lists, line breaks. Intentionally lightweight, no deps.
function renderMarkdown(raw, emptyText) {
  if (!raw || !raw.trim()) {
    return `<p class="text-slate-600 italic">${emptyText}</p>`;
  }

  let html = escapeHtml(raw);

  html = html.replace(
    /```([\s\S]*?)```/g,
    (_, code) =>
      `<pre class="bg-slate-950 border border-slate-800 rounded-md p-3 my-2 overflow-x-auto text-xs font-mono text-slate-300">${code.trim()}</pre>`
  );
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="bg-slate-800 text-teal-300 px-1.5 py-0.5 rounded text-[0.85em] font-mono">$1</code>'
  );
  html = html.replace(
    /\*\*([^*]+)\*\*/g,
    '<strong class="text-slate-100 font-semibold">$1</strong>'
  );
  html = html.replace(/\*([^*]+)\*/g, '<em class="text-slate-300">$1</em>');
  html = html.replace(
    /^### (.*)$/gm,
    '<h3 class="text-slate-100 font-semibold mt-3 mb-1">$1</h3>'
  );
  html = html.replace(
    /^## (.*)$/gm,
    '<h2 class="text-slate-100 font-bold text-base mt-3 mb-1">$1</h2>'
  );
  html = html.replace(
    /^- (.*)$/gm,
    '<li class="ml-4 list-disc text-slate-300">$1</li>'
  );
  html = html.replace(/\n{2,}/g, '</p><p class="mt-2">');
  html = html.replace(/\n/g, "<br/>");

  return `<p>${html}</p>`;
}

function formatDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function LogEditor({ activeProject, projectEntries, onSaveEntry }) {
  const { t } = useTranslation();
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [duration, setDuration] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [text, setText] = useState("");
  const [mode, setMode] = useState("edit");

  const sortedEntries = [...projectEntries].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const emptyPreviewText = t("logEditor.emptyPreview");

  function handleSubmit(e) {
    e.preventDefault();
    if (!duration || !text.trim()) return;

    onSaveEntry({
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `entry-${Date.now()}`,
      projectId: activeProject.id,
      date,
      durationMinutes: Number(duration),
      text: text.trim(),
      tags: tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });

    setDuration("");
    setTagsInput("");
    setText("");
    setMode("edit");
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <header className="px-8 py-6 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: activeProject.color }}
          />
          <h2 className="text-xl font-semibold text-slate-100 truncate">
            {activeProject.name}
          </h2>
        </div>
        {activeProject.description && (
          <p className="text-sm text-slate-500 mt-1">
            {activeProject.description}
          </p>
        )}
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2">
        {/* Timeline */}
        <div className="overflow-y-auto border-r border-slate-800 px-8 py-6">
          <h3 className="font-mono text-xs uppercase tracking-wider text-slate-500 mb-4">
            {t("logEditor.timelineHeader", { count: sortedEntries.length })}
          </h3>

          {sortedEntries.length === 0 ? (
            <p className="text-sm text-slate-600 italic">
              {t("logEditor.noEntries")}
            </p>
          ) : (
            <ol className="relative border-l border-slate-800 ml-1.5 space-y-6 pb-4">
              {sortedEntries.map((entry) => (
                <li key={entry.id} className="ml-5 relative">
                  <span
                    className="absolute -left-[26px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-slate-950"
                    style={{ backgroundColor: activeProject.color }}
                  />
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="font-mono text-xs text-slate-500">
                      {formatDate(entry.date)}
                    </span>
                    <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900">
                      +{formatDuration(entry.durationMinutes)}
                    </span>
                    {entry.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div
                    className="text-sm text-slate-300 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(entry.text, emptyPreviewText),
                    }}
                  />
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Form */}
        <div className="overflow-y-auto px-8 py-6">
          <h3 className="font-mono text-xs uppercase tracking-wider text-slate-500 mb-4">
            {t("logEditor.newEntry")}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  {t("logEditor.dateLabel")}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  {t("logEditor.durationLabel")}
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder={t("logEditor.durationPlaceholder")}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">
                {t("logEditor.tagsLabel")}
              </label>
              <input
                type="text"
                placeholder={t("logEditor.tagsPlaceholder")}
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs text-slate-500">
                  {t("logEditor.notesLabel")}
                </label>
                <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-md p-0.5">
                  <button
                    type="button"
                    onClick={() => setMode("edit")}
                    className={`px-2.5 py-1 text-xs rounded font-mono transition-colors ${
                      mode === "edit"
                        ? "bg-slate-800 text-slate-100"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {t("logEditor.editButton")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("preview")}
                    className={`px-2.5 py-1 text-xs rounded font-mono transition-colors ${
                      mode === "preview"
                        ? "bg-slate-800 text-slate-100"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {t("logEditor.previewButton")}
                  </button>
                </div>
              </div>

              {mode === "edit" ? (
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t("logEditor.textPlaceholder")}
                  rows={10}
                  className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 font-mono leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                  required
                />
              ) : (
                <div
                  className="w-full min-h-[15rem] bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-300 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(text, emptyPreviewText),
                  }}
                />
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-md bg-teal-500 hover:bg-teal-400 text-slate-950 text-sm font-semibold transition-colors"
            >
              {t("logEditor.saveButton")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
