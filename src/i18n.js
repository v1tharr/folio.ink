import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// npm install i18next react-i18next i18next-browser-languagedetector

const resources = {
  en: {
    translation: {
      app: {
        name: "folio.ink",
      },
      sidebar: {
        tagline: "local dev journal",
        version: "v0.1.0 · offline",
      },
      nav: {
        projects: "Projects",
        logs: "Logs",
        stats: "Stats",
        selectProjectFirst: "Select a project first",
        na: "n/a",
      },
      language: {
        en: "EN",
        ru: "RU",
      },
      projectCard: {
        noDescription: "No description yet.",
        entry_one: "{{count}} entry",
        entry_other: "{{count}} entries",
      },
      projectsScreen: {
        header: "Projects",
        newProject: "+ New project",
        emptyState: "No projects yet. Create one to start logging.",
        tracked_one: "{{count}} project tracked",
        tracked_other: "{{count}} projects tracked",
      },
      logsScreen: {
        selectFirst: "Select a project from the Projects screen first.",
      },
      logEditor: {
        timelineHeader_one: "Timeline · {{count}} entry",
        timelineHeader_other: "Timeline · {{count}} entries",
        noEntries: "No entries yet. Log your first session →",
        newEntry: "New entry",
        dateLabel: "Date",
        durationLabel: "Minutes spent",
        durationPlaceholder: "45",
        tagsLabel: "Tags (comma separated)",
        tagsPlaceholder: "bugfix, api, refactor",
        notesLabel: "Notes (Markdown)",
        editButton: "Edit",
        previewButton: "Preview",
        textPlaceholder:
          "What did you work on? Use **bold**, *italic*, `code`, ```blocks```...",
        saveButton: "Save entry",
        emptyPreview: "Nothing to preview yet.",
      },
      stats: {
        header: "Stats",
        thisWeek: "This week",
        allTime: "All time",
        totalEntries: "Total entries",
        timeByProject: "Time by project",
        noData: "No data yet.",
        activityHeader: "Activity — last 12 weeks",
        less: "Less",
        more: "More",
      },
      modal: {
        title: "New project",
        nameLabel: "Name",
        namePlaceholder: "e.g. Mobile app rewrite",
        descriptionLabel: "Description",
        descriptionPlaceholder: "What is this project about?",
        colorLabel: "Color",
        cancel: "Cancel",
        create: "Create",
      },
    },
  },
  ru: {
    translation: {
      app: {
        name: "folio.ink",
      },
      sidebar: {
        tagline: "локальный дневник разработчика",
        version: "v0.1.0 · офлайн",
      },
      nav: {
        projects: "Проекты",
        logs: "Записи",
        stats: "Статистика",
        selectProjectFirst: "Сначала выберите проект",
        na: "н/д",
      },
      language: {
        en: "EN",
        ru: "RU",
      },
      projectCard: {
        noDescription: "Пока нет описания.",
        entry_one: "{{count}} запись",
        entry_few: "{{count}} записи",
        entry_many: "{{count}} записей",
        entry_other: "{{count}} записи",
      },
      projectsScreen: {
        header: "Проекты",
        newProject: "+ Новый проект",
        emptyState: "Пока нет проектов. Создайте первый, чтобы начать вести записи.",
        tracked_one: "{{count}} проект отслеживается",
        tracked_few: "{{count}} проекта отслеживается",
        tracked_many: "{{count}} проектов отслеживается",
        tracked_other: "{{count}} проекта отслеживается",
      },
      logsScreen: {
        selectFirst: "Сначала выберите проект на экране «Проекты».",
      },
      logEditor: {
        timelineHeader_one: "Хроника · {{count}} запись",
        timelineHeader_few: "Хроника · {{count}} записи",
        timelineHeader_many: "Хроника · {{count}} записей",
        timelineHeader_other: "Хроника · {{count}} записи",
        noEntries: "Записей пока нет. Добавьте первую сессию →",
        newEntry: "Новая запись",
        dateLabel: "Дата",
        durationLabel: "Затрачено минут",
        durationPlaceholder: "45",
        tagsLabel: "Теги (через запятую)",
        tagsPlaceholder: "багфикс, api, рефакторинг",
        notesLabel: "Заметки (Markdown)",
        editButton: "Редактор",
        previewButton: "Превью",
        textPlaceholder:
          "Чем вы занимались? Используйте **жирный**, *курсив*, `код`, ```блоки```...",
        saveButton: "Сохранить запись",
        emptyPreview: "Пока нечего показать.",
      },
      stats: {
        header: "Статистика",
        thisWeek: "На этой неделе",
        allTime: "За всё время",
        totalEntries: "Всего записей",
        timeByProject: "Время по проектам",
        noData: "Данных пока нет.",
        activityHeader: "Активность — последние 12 недель",
        less: "Меньше",
        more: "Больше",
      },
      modal: {
        title: "Новый проект",
        nameLabel: "Название",
        namePlaceholder: "например, Переписать мобильное приложение",
        descriptionLabel: "Описание",
        descriptionPlaceholder: "О чём этот проект?",
        colorLabel: "Цвет",
        cancel: "Отмена",
        create: "Создать",
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: ["en", "ru"],
    nonExplicitSupportedLngs: true,
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "devlog_language",
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
