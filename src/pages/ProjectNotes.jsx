import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LogEditor from '../components/LogEditor'

/**
 * Экран заметок/логов конкретного проекта — маршрут /projects/:id.
 *
 * Сам список записей и форма добавления/редактирования уже реализованы
 * в LogEditor.jsx (timeline слева + форма справа), поэтому эта страница —
 * тонкая обвязка на уровне роутинга:
 *   1. достаёт :id из URL (useParams),
 *   2. резолвит активный проект и его записи из данных, которые лежат
 *      выше по дереву (App.jsx — единый источник правды на localStorage/API),
 *   3. обрабатывает случаи "проект не найден" / "id битый".
 *
 * id из URL — всегда строка, а project.id может быть числом (бэкенд,
 * autoincrement) или строкой (mock/localStorage-фикстуры) — поэтому
 * сравнение идёт через String(...), а не строгое ===.
 */
export default function ProjectNotes({
	projects,
	entries,
	onSaveEntry,
	onUpdateEntry,
	onDeleteEntry,
}) {
	const { id } = useParams()
	const navigate = useNavigate()
	const { t } = useTranslation()

	const activeProject = useMemo(
		() => projects.find(p => String(p.id) === String(id)) ?? null,
		[projects, id],
	)

	// Имитация "получения логов для активного проекта": в реальном виде
	// это будет GET /api/projects/:id/entries (см. getEntries в api/client.js,
	// пока не реализован на бэке), а сейчас — локальная фильтрация общего
	// списка entries, который App.jsx хранит в localStorage/state. Как только
	// onSaveEntry/onUpdateEntry/onDeleteEntry обновляют entries в App.jsx,
	// этот useMemo пересчитывается и список ниже обновляется сам собой —
	// без ручного рефетча.
	const projectEntries = useMemo(
		() => entries.filter(e => String(e.projectId) === String(id)),
		[entries, id],
	)

	if (!activeProject) {
		return (
			<div className='h-screen flex flex-col items-center justify-center gap-4 px-8 text-center'>
				<p className='text-slate-600 text-sm'>{t('logsScreen.selectFirst')}</p>
				<button
					type='button'
					onClick={() => navigate('/')}
					className='px-4 py-2 rounded-md bg-teal-500 hover:bg-teal-400 text-slate-950 text-sm font-semibold transition-colors'
				>
					{t('nav.projects')}
				</button>
			</div>
		)
	}

	return (
		<LogEditor
			activeProject={activeProject}
			projectEntries={projectEntries}
			onSaveEntry={onSaveEntry}
			onUpdateEntry={onUpdateEntry}
			onDeleteEntry={onDeleteEntry}
		/>
	)
}
