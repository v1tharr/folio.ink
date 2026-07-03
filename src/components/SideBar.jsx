import { useTranslation } from "react-i18next";

export default function SideBar({ screen, setScreen, activeProjectId }) {
  const { t, i18n } = useTranslation();

  const navItems = [
    { key: "projects", label: t("nav.projects"), icon: "📁" },
    { key: "logs", label: t("nav.logs"), icon: "📝", disabled: !activeProjectId },
    { key: "stats", label: t("nav.stats"), icon: "📊" },
  ];

  const currentLang = i18n.language?.startsWith("ru") ? "ru" : "en";

  function handleLanguageChange(lang) {
    i18n.changeLanguage(lang);
  }

  return (
    <aside className="h-screen w-56 shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col">
      <div className="px-5 py-6 border-b border-slate-800">
        <h1 className="font-mono text-lg font-semibold text-slate-100 tracking-tight">
          folio<span className="text-teal-400">.ink</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">{t("sidebar.tagline")}</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = screen === item.key;
          const isDisabled = item.disabled;
          return (
            <button
              key={item.key}
              type="button"
              disabled={isDisabled}
              onClick={() => !isDisabled && setScreen(item.key)}
              title={isDisabled ? t("nav.selectProjectFirst") : undefined}
              className={[
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors border",
                isDisabled
                  ? "text-slate-600 border-transparent cursor-not-allowed"
                  : isActive
                  ? "bg-slate-900 text-slate-100 border-slate-800"
                  : "text-slate-400 border-transparent hover:bg-slate-900 hover:text-slate-200",
              ].join(" ")}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span>{item.label}</span>
              {isDisabled && (
                <span className="ml-auto text-[10px] text-slate-700 font-mono">
                  {t("nav.na")}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-slate-800 space-y-3">
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-md p-0.5">
          <button
            type="button"
            onClick={() => handleLanguageChange("en")}
            aria-pressed={currentLang === "en"}
            className={`flex-1 px-2.5 py-1 text-xs rounded font-mono transition-colors ${
              currentLang === "en"
                ? "bg-slate-800 text-slate-100"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {t("language.en")}
          </button>
          <button
            type="button"
            onClick={() => handleLanguageChange("ru")}
            aria-pressed={currentLang === "ru"}
            className={`flex-1 px-2.5 py-1 text-xs rounded font-mono transition-colors ${
              currentLang === "ru"
                ? "bg-slate-800 text-slate-100"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {t("language.ru")}
          </button>
        </div>
        <p className="text-[11px] text-slate-600 font-mono">{t("sidebar.version")}</p>
      </div>
    </aside>
  );
}
