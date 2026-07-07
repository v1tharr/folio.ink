import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import './i18n'
import SideBar from './components/SideBar'
import ProjectCard from './components/ProjectCard'
import LogEditor from './components/LogEditor'

const PROJECTS_KEY = 'devlog_projects'
const ENTRIES_KEY = 'devlog_entries'

const COLOR_PRESETS = [
	'#2dd4bf', // teal
	'#818cf8', // indigo
	'#f472b6', // pink
	'#fb923c', // orange
	'#4ade80', // green
	'#facc15', // yellow
	'#38bdf8', // sky
	'#f87171', // red
]

function isoDaysAgo(n) {
	const d = new Date()
	d.setDate(d.getDate() - n)
	return d.toISOString().slice(0, 10)
}

function escapeHtml(str) {
	return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Minimal markdown-ish renderer, mirrors the one in LogEditor.jsx
function renderMarkdown(raw, emptyText) {
	if (!raw || !raw.trim()) {
		return `<p class="text-slate-600 italic">${emptyText}</p>`
	}

	let html = escapeHtml(raw)

	html = html.replace(
		/```([\s\S]*?)```/g,
		(_, code) =>
			`<pre class="bg-slate-950 border border-slate-800 rounded-md p-3 my-2 overflow-x-auto text-xs font-mono text-slate-300">${code.trim()}</pre>`,
	)
	html = html.replace(
		/`([^`]+)`/g,
		'<code class="bg-slate-800 text-teal-300 px-1.5 py-0.5 rounded text-[0.85em] font-mono">$1</code>',
	)
	html = html.replace(
		/\*\*([^*]+)\*\*/g,
		'<strong class="text-slate-100 font-semibold">$1</strong>',
	)
	html = html.replace(/\*([^*]+)\*/g, '<em class="text-slate-300">$1</em>')
	html = html.replace(
		/^### (.*)$/gm,
		'<h3 class="text-slate-100 font-semibold mt-3 mb-1">$1</h3>',
	)
	html = html.replace(
		/^## (.*)$/gm,
		'<h2 class="text-slate-100 font-bold text-base mt-3 mb-1">$1</h2>',
	)
	html = html.replace(
		/^- (.*)$/gm,
		'<li class="ml-4 list-disc text-slate-300">$1</li>',
	)
	html = html.replace(/\n{2,}/g, '</p><p class="mt-2">')
	html = html.replace(/\n/g, '<br/>')

	return `<p>${html}</p>`
}

function formatDuration(minutes) {
	const h = Math.floor(minutes / 60)
	const m = minutes % 60
	if (h === 0) return `${m}m`
	if (m === 0) return `${h}h`
	return `${h}h ${m}m`
}

function buildMockData() {
	const projects = [
		{
			id: 'proj-devlog',
			name: 'DevLog',
			description: 'Local-first developer diary, React + Vite + Tailwind.',
			color: COLOR_PRESETS[0],
		},
		{
			id: 'proj-api',
			name: 'Billing API',
			description: 'Internal billing microservice, Node + Postgres.',
			color: COLOR_PRESETS[1],
		},
		{
			id: 'proj-side',
			name: 'Terminal Portfolio',
			description: 'Personal site styled like a shell prompt.',
			color: COLOR_PRESETS[3],
		},
	]

	const entries = [
		{
			id: 'e1',
			projectId: 'proj-devlog',
			date: isoDaysAgo(0),
			durationMinutes: 90,
			text: 'Scaffolded the **Sidebar** and **ProjectCard** components. Wired up `localStorage` persistence with a lazy `useState` initializer.\n\n- Nav highlights active screen\n- Logs tab disabled until a project is selected',
			tags: ['setup', 'react'],
		},
		{
			id: 'e2',
			projectId: 'proj-devlog',
			date: isoDaysAgo(2),
			durationMinutes: 45,
			text: 'Sketched the data model for `Project` and `Entry`. Decided against a backend for v1 — everything stays in `localStorage` so the app works fully offline.',
			tags: ['planning'],
		},
		{
			id: 'e3',
			projectId: 'proj-devlog',
			date: isoDaysAgo(6),
			durationMinutes: 120,
			text: 'Built the markdown-lite renderer for entry notes. Supports `**bold**`, `*italic*`, inline `code`, and fenced ```blocks```.',
			tags: ['markdown', 'editor'],
		},
		{
			id: 'e4',
			projectId: 'proj-api',
			date: isoDaysAgo(1),
			durationMinutes: 75,
			text: 'Debugged a race condition in the invoice webhook handler. Root cause was a missing `await` on the idempotency check.',
			tags: ['bugfix', 'webhooks'],
		},
		{
			id: 'e5',
			projectId: 'proj-api',
			date: isoDaysAgo(4),
			durationMinutes: 60,
			text: 'Added retry logic with exponential backoff for the payment gateway client. Wrote unit tests for the backoff calculator.',
			tags: ['reliability', 'tests'],
		},
		{
			id: 'e6',
			projectId: 'proj-api',
			date: isoDaysAgo(9),
			durationMinutes: 50,
			text: 'Migrated the `invoices` table to add a `currency` column.',
			tags: ['migration'],
		},
		{
			id: 'e7',
			projectId: 'proj-side',
			date: isoDaysAgo(3),
			durationMinutes: 30,
			text: 'Prototyped a boot-sequence animation for the landing page using CSS keyframes only, no JS.',
			tags: ['css', 'animation'],
		},
		{
			id: 'e8',
			projectId: 'proj-side',
			date: isoDaysAgo(11),
			durationMinutes: 40,
			text: 'Set up the project repo and deployed a placeholder page.',
			tags: ['setup'],
		},
	]

	return { projects, entries }
}

function loadFromStorage(key, fallback) {
	if (typeof window === 'undefined') return fallback
	try {
		const raw = window.localStorage.getItem(key)
		if (!raw) return fallback
		const parsed = JSON.parse(raw)
		return Array.isArray(parsed) ? parsed : fallback
	} catch {
		return fallback
	}
}

export default function App() {
	const { t } = useTranslation()
	const mock = useMemo(buildMockData, [])

	const [projects, setProjects] = useState(() =>
		loadFromStorage(PROJECTS_KEY, mock.projects),
	)
	const [entries, setEntries] = useState(() =>
		loadFromStorage(ENTRIES_KEY, mock.entries),
	)

	const [screen, setScreen] = useState('projects')
	const [activeProjectId, setActiveProjectId] = useState(null)
	const [showNewProjectModal, setShowNewProjectModal] = useState(false)
	const [editingProject, setEditingProject] = useState(null)

	useEffect(() => {
		window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
	}, [projects])

	useEffect(() => {
		window.localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
	}, [entries])

	const activeProject = projects.find(p => p.id === activeProjectId) || null
	const projectEntries = entries.filter(e => e.projectId === activeProjectId)

	function handleSelectProject(id) {
		setActiveProjectId(id)
		setScreen('logs')
	}

	function handleAddProject(project) {
		setProjects(prev => [...prev, project])
		setShowNewProjectModal(false)
	}
	function handleUpdateProject(updatedProject) {
		setProjects(prev =>
			prev.map(p =>
				p.id === updatedProject.id ? { ...p, ...updatedProject } : p,
			),
		)
		setEditingProject(null)
	}
	function handleDeleteProject(projectId) {
		// 1. Удаляем сам проект
		setProjects(prev => prev.filter(p => p.id !== projectId))

		// 2. Очищаем все записи, принадлежащие этому проекту
		setEntries(prev => prev.filter(e => e.projectId !== projectId))

		// 3. Если удаленный проект был активным, сбрасываем его и переключаем экран
		if (activeProjectId === projectId) {
			setActiveProjectId(null)
			setScreen('projects')
		}
	}

	function handleSaveEntry(entry) {
		setEntries(prev => [...prev, entry])
	}

	function handleUpdateEntry(updatedEntry) {
		setEntries(prev =>
			prev.map(e => (e.id === updatedEntry.id ? { ...e, ...updatedEntry } : e)),
		)
	}

	function handleDeleteEntry(entryId) {
		setEntries(prev => prev.filter(e => e.id !== entryId))
	}

	return (
		<div className='h-screen w-screen flex bg-slate-950 text-slate-200 overflow-hidden'>
			<SideBar
				screen={screen}
				setScreen={setScreen}
				activeProjectId={activeProjectId}
			/>

			<main className='flex-1 min-w-0 h-screen overflow-hidden'>
				{screen === 'projects' && (
					<ProjectsScreen
						projects={projects}
						entries={entries}
						onSelect={handleSelectProject}
						onDeleteProject={handleDeleteProject}
						onEditProject={setEditingProject}
						onOpenModal={() => setShowNewProjectModal(true)}
					/>
				)}

				{screen === 'logs' && activeProject && (
					<LogEditor
						activeProject={activeProject}
						projectEntries={projectEntries}
						onSaveEntry={handleSaveEntry}
						onUpdateEntry={handleUpdateEntry}
						onDeleteEntry={handleDeleteEntry}
					/>
				)}

				{screen === 'logs' && !activeProject && (
					<div className='h-screen flex items-center justify-center'>
						<p className='text-slate-600 text-sm'>
							{t('logsScreen.selectFirst')}
						</p>
					</div>
				)}

				{screen === 'stats' && (
					<StatsScreen projects={projects} entries={entries} />
				)}
			</main>

			{showNewProjectModal && (
				<NewProjectModal
					onClose={() => setShowNewProjectModal(false)}
					onCreate={handleAddProject}
				/>
			)}

			{editingProject && (
				<NewProjectModal
					project={editingProject}
					onClose={() => setEditingProject(null)}
					onCreate={handleUpdateProject}
				/>
			)}
		</div>
	)
}

function ProjectsScreen({
	projects,
	entries,
	onSelect,
	onDeleteProject,
	onEditProject,
	onOpenModal,
}) {
	const { t } = useTranslation()
	return (
		<div className='h-screen overflow-y-auto px-8 py-6'>
			<div className='flex items-center justify-between mb-6'>
				<div>
					<h2 className='text-xl font-semibold text-slate-100'>
						{t('projectsScreen.header')}
					</h2>
					<p className='text-sm text-slate-500 mt-1'>
						{t('projectsScreen.tracked', { count: projects.length })}
					</p>
				</div>
				<button
					type='button'
					onClick={onOpenModal}
					className='px-4 py-2 rounded-md bg-teal-500 hover:bg-teal-400 text-slate-950 text-sm font-semibold transition-colors'
				>
					{t('projectsScreen.newProject')}
				</button>
			</div>

			{projects.length === 0 ? (
				<div className='border border-dashed border-slate-800 rounded-lg py-16 text-center'>
					<p className='text-slate-500 text-sm'>
						{t('projectsScreen.emptyState')}
					</p>
				</div>
			) : (
				<div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
					{projects.map(project => (
						<ProjectCard
							key={project.id}
							project={project}
							entries={entries}
							onSelect={onSelect}
							onEdit={onEditProject}
							onDelete={onDeleteProject}
						/>
					))}
				</div>
			)}
		</div>
	)
}

function NewProjectModal({ project, onClose, onCreate }) {
	const { t } = useTranslation()
	const isEditing = Boolean(project)
	const [name, setName] = useState(project?.name ?? '')
	const [description, setDescription] = useState(project?.description ?? '')
	const [color, setColor] = useState(project?.color ?? COLOR_PRESETS[0])

	function handleSubmit(e) {
		e.preventDefault()
		if (!name.trim()) return
		onCreate({
			id: isEditing
				? project.id
				: typeof crypto !== 'undefined' && crypto.randomUUID
					? crypto.randomUUID()
					: `proj-${Date.now()}`,
			name: name.trim(),
			description: description.trim(),
			color,
		})
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4'>
			<div className='w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg p-6'>
				<h3 className='text-lg font-semibold text-slate-100 mb-4'>
					{isEditing ? t('modal.editTitle') : t('modal.title')}
				</h3>

				<form onSubmit={handleSubmit} className='space-y-4'>
					<div>
						<label className='block text-xs text-slate-500 mb-1'>
							{t('modal.nameLabel')}
						</label>
						<input
							type='text'
							autoFocus
							value={name}
							onChange={e => setName(e.target.value)}
							placeholder={t('modal.namePlaceholder')}
							className='w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500'
							required
						/>
					</div>

					<div>
						<label className='block text-xs text-slate-500 mb-1'>
							{t('modal.descriptionLabel')}
						</label>
						<textarea
							value={description}
							onChange={e => setDescription(e.target.value)}
							placeholder={t('modal.descriptionPlaceholder')}
							rows={3}
							className='w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500'
						/>
					</div>

					<div>
						<label className='block text-xs text-slate-500 mb-2'>
							{t('modal.colorLabel')}
						</label>
						<div className='flex flex-wrap gap-2'>
							{COLOR_PRESETS.map(c => (
								<button
									key={c}
									type='button'
									onClick={() => setColor(c)}
									className={`w-7 h-7 rounded-full transition-transform ${
										color === c
											? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-slate-200 scale-110'
											: 'hover:scale-110'
									}`}
									style={{ backgroundColor: c }}
									aria-label={`Choose color ${c}`}
								/>
							))}
						</div>
					</div>

					<div className='flex gap-2 pt-2'>
						<button
							type='button'
							onClick={onClose}
							className='flex-1 py-2.5 rounded-md border border-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors'
						>
							{t('modal.cancel')}
						</button>
						<button
							type='submit'
							className='flex-1 py-2.5 rounded-md bg-teal-500 hover:bg-teal-400 text-slate-950 text-sm font-semibold transition-colors'
						>
							{isEditing ? t('modal.save') : t('modal.create')}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

function startOfWeek(date) {
	const d = new Date(date)
	const day = d.getDay() // 0 - Воскресенье, 1 - Понедельник...
	d.setDate(d.getDate() - day) // Смещаем на текущее воскресенье
	d.setHours(0, 0, 0, 0)
	return d
}

function StatsScreen({ projects, entries }) {
	const { t } = useTranslation()

	// Стейт смещения недель: 0 — текущая, -1 — прошлая, -2 — позапрошлая и т.д.
	const [weekOffset, setWeekOffset] = useState(0)
	// Выбранный день в календаре активности (для панели заметок справа)
	const [selectedDay, setSelectedDay] = useState(null)

	// 1. Вычисляем диапазон для выбранной недели (для карточек и графика дней)
	const selectedWeekStart = useMemo(() => {
		const d = startOfWeek(new Date())
		d.setDate(d.getDate() + weekOffset * 7)
		return d
	}, [weekOffset])

	const selectedWeekEnd = useMemo(() => {
		const d = new Date(selectedWeekStart)
		d.setDate(d.getDate() + 6)
		d.setHours(23, 59, 59, 999)
		return d
	}, [selectedWeekStart])

	// Фильтруем записи для недельных графиков
	const selectedWeekEntries = useMemo(() => {
		return entries.filter(e => {
			const entryDate = new Date(`${e.date}T00:00:00`)
			return entryDate >= selectedWeekStart && entryDate <= selectedWeekEnd
		})
	}, [entries, selectedWeekStart, selectedWeekEnd])

	// --- РАСЧЕТ ТОП-ТЕГОВ (Глобальные — за всё время) ---
	const tagCounts = {}
	entries.forEach(e => {
		if (Array.isArray(e.tags)) {
			e.tags.forEach(tag => {
				const trimmed = tag.trim().toLowerCase()
				if (trimmed) {
					tagCounts[trimmed] = (tagCounts[trimmed] || 0) + 1
				}
			})
		}
	})

	const topTags = Object.entries(tagCounts)
		.map(([name, count]) => ({ name, count }))
		.sort((a, b) => b.count - a.count)
		.slice(0, 6)

	// --- РАСЧЕТ ДНЕЙ НЕДЕЛИ ДЛЯ ГРАФИКА (за выбранную неделю) ---
	const weekdayMinutes = [0, 0, 0, 0, 0, 0, 0]
	selectedWeekEntries.forEach(e => {
		const d = new Date(`${e.date}T00:00:00`)
		let dayIndex = d.getDay()
		dayIndex = dayIndex === 0 ? 6 : dayIndex - 1
		weekdayMinutes[dayIndex] += e.durationMinutes || 0
	})

	const maxWeekdayMinutes = Math.max(...weekdayMinutes, 1)
	const weekdayLabels = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

	// --- РАСЧЕТ МЕТРИК ВЕРХНЕГО РЯДА ---
	const minutesThisWeek = selectedWeekEntries.reduce(
		(sum, e) => sum + (e.durationMinutes || 0),
		0,
	)
	const totalMinutes = entries.reduce(
		(sum, e) => sum + (e.durationMinutes || 0),
		0,
	)

	const perProject = projects
		.map(project => {
			const minutes = selectedWeekEntries
				.filter(e => e.projectId === project.id)
				.reduce((sum, e) => sum + (e.durationMinutes || 0), 0)
			return { project, minutes }
		})
		.sort((a, b) => b.minutes - a.minutes)

	// --- ПОСТРОЕНИЕ ГЛОБАЛЬНОЙ СЕТКИ АКТИВНОСТИ (ВСЕГДА ОТ ТЕКУЩЕГО ДНЯ — GITHUB-STYLE) ---

	const now = useMemo(() => new Date(), [])
	const DAYS = 84 // 12 недель

	const alignedStart = useMemo(() => {
		const gridStart = new Date(now)
		gridStart.setDate(gridStart.getDate() - (DAYS - 1))

		// Находим настоящий Понедельник для самого первого дня сетки
		const d = new Date(gridStart)
		const day = d.getDay()
		const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Корректный сдвиг на Пн
		const monday = new Date(d.setDate(diff))
		monday.setHours(0, 0, 0, 0)
		return monday
	}, [now])

	const minutesByDate = useMemo(() => {
		const map = {}
		entries.forEach(e => {
			map[e.date] = (map[e.date] || 0) + (e.durationMinutes || 0)
		})
		return map
	}, [entries])

	const weeks = useMemo(() => {
		const generatedWeeks = []
		let cursor = new Date(alignedStart)

		const todayTarget = new Date()
		todayTarget.setHours(0, 0, 0, 0)

		while (cursor <= todayTarget || generatedWeeks.length < 12) {
			const week = []
			for (let i = 0; i < 7; i++) {
				const iso = cursor.toISOString().slice(0, 10)
				week.push({ date: iso, minutes: minutesByDate[iso] || 0 })
				cursor.setDate(cursor.getDate() + 1)
			}
			generatedWeeks.push(week)

			if (generatedWeeks.length > 20) break
		}

		return generatedWeeks.slice(-12)
	}, [alignedStart, minutesByDate])

	// Записи за выбранный в календаре день (для панели справа)
	const selectedDayEntries = useMemo(() => {
		if (!selectedDay) return []
		return entries
			.filter(e => e.date === selectedDay)
			.sort((a, b) => (b.durationMinutes || 0) - (a.durationMinutes || 0))
	}, [entries, selectedDay])

	function intensityClass(minutes) {
		if (minutes === 0) return 'bg-slate-900'
		if (minutes < 30) return 'bg-teal-950'
		if (minutes < 60) return 'bg-teal-800'
		if (minutes < 120) return 'bg-teal-600'
		return 'bg-teal-400'
	}

	const formatPeriod = () => {
		const options = { month: 'short', day: 'numeric' }
		return `${selectedWeekStart.toLocaleDateString(undefined, options)} – ${selectedWeekEnd.toLocaleDateString(undefined, options)}`
	}
	return (
		<div
			className='h-screen overflow-y-auto px-8 py-6'
			style={{ scrollbarWidth: 'none' }}
		>
			{/* Заголовок и Управление неделями */}
			<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
				<h2 className='text-xl font-semibold text-slate-100'>
					{t('stats.header')}
				</h2>

				{/* Контроллер переключения недель */}
				<div className='flex items-center gap-1 bg-slate-950/40 backdrop-blur-sm border border-slate-800 hover:border-slate-700/80 rounded-lg p-1.5 self-start sm:self-auto transition-all shadow-sm'>
					<button
						type='button'
						onClick={() => setWeekOffset(prev => prev - 1)}
						className='p-2 rounded-md text-slate-400 hover:text-teal-400 hover:bg-slate-900 border border-transparent hover:border-slate-800 active:scale-95 transition-all'
						title={t('stats.prevWeek')}
					>
						{/* Иконка Шеврон влево */}
						<svg
							xmlns='http://www.w3.org/2000/svg'
							viewBox='0 0 16 16'
							fill='currentColor'
							className='w-4 h-4'
						>
							<path
								fillRule='evenodd'
								d='M9.78 4.22a.75.75 0 0 1 0 1.06L6.56 8.5l3.22 3.22a.75.75 0 1 1-1.06 1.06l-3.75-3.75a.75.75 0 0 1 0-1.06l3.75-3.75a.75.75 0 0 1 1.06 0Z'
								clipRule='evenodd'
							/>
						</svg>
					</button>

					<span className='text-xs font-mono font-medium text-slate-300 px-3 min-w-[140px] text-center select-none tracking-wide'>
						{weekOffset === 0 ? t('stats.currentWeek') : formatPeriod()}
					</span>

					<button
						type='button'
						onClick={() => setWeekOffset(prev => Math.min(0, prev + 1))}
						disabled={weekOffset === 0}
						className={`p-2 rounded-md border transition-all ${
							weekOffset === 0
								? 'text-slate-800 border-transparent opacity-40 cursor-not-allowed'
								: 'text-slate-400 hover:text-teal-400 hover:bg-slate-900 border-transparent hover:border-slate-800 active:scale-95'
						}`}
						title={t('stats.nextWeek')}
					>
						{/* Иконка Шеврон вправо */}
						<svg
							xmlns='http://www.w3.org/2000/svg'
							viewBox='0 0 16 16'
							fill='currentColor'
							className='w-4 h-4'
						>
							<path
								fillRule='evenodd'
								d='M6.22 4.22a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06L9.44 8.5 6.22 5.28a.75.75 0 0 1 0-1.06Z'
								clipRule='evenodd'
							/>
						</svg>
					</button>
				</div>
			</div>

			{/* Карточки метрик */}
			<div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8'>
				<StatCard
					label={
						weekOffset === 0 ? t('stats.thisWeek') : t('stats.currentWeek')
					}
					value={`${(minutesThisWeek / 60).toFixed(1)}h`}
				/>
				<StatCard
					label={t('stats.allTime')}
					value={`${(totalMinutes / 60).toFixed(1)}h`}
				/>
				<StatCard
					label={t('stats.totalEntries')}
					value={String(selectedWeekEntries.length)}
				/>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
				{/* Время по проектам */}
				<section>
					<h3 className='font-mono text-xs uppercase tracking-wider text-slate-500 mb-4'>
						{t('stats.timeByProject')}
					</h3>
					{perProject.filter(p => p.minutes > 0).length === 0 ? (
						<div className='bg-slate-900/40 border border-slate-900 rounded-lg p-5 h-[190px] flex items-center justify-center'>
							<p className='text-sm text-slate-600 italic'>
								{t('stats.noData')}
							</p>
						</div>
					) : (
						<div
							className='space-y-3 bg-slate-900/40 border border-slate-900 rounded-lg p-5 h-[190px] overflow-y-auto'
							style={{ scrollbarWidth: 'none' }}
						>
							{perProject.map(({ project, minutes }) => {
								if (minutes === 0) return null
								const pct = minutesThisWeek
									? (minutes / minutesThisWeek) * 100
									: 0
								return (
									<div key={project.id}>
										<div className='flex items-center justify-between mb-1 text-sm'>
											<span className='text-slate-300 flex items-center gap-2 truncate'>
												<span
													className='w-2 h-2 rounded-full shrink-0'
													style={{ backgroundColor: project.color }}
												/>
												{project.name}
											</span>
											<span className='font-mono text-xs text-slate-500 shrink-0'>
												{(minutes / 60).toFixed(1)}h
											</span>
										</div>
										<div className='h-1.5 rounded-full bg-slate-950 overflow-hidden'>
											<div
												className='h-full rounded-full transition-all duration-500'
												style={{
													width: `${pct}%`,
													backgroundColor: project.color,
												}}
											/>
										</div>
									</div>
								)
							})}
						</div>
					)}
				</section>

				{/* Столбчатый график по дням недели */}
				<section>
					<h3 className='font-mono text-xs uppercase tracking-wider text-slate-500 mb-4'>
						{t('stats.daysHeader')}
					</h3>
					<div className='bg-slate-900/40 border border-slate-900 rounded-lg p-5 h-[190px] flex items-end justify-between gap-2 pt-8'>
						{weekdayMinutes.map((mins, idx) => {
							const heightPct = (mins / maxWeekdayMinutes) * 100
							const hoursLabel = (mins / 60).toFixed(1)
							return (
								<div
									key={idx}
									className='flex-1 flex flex-col items-center gap-2 h-full justify-end group/bar relative'
								>
									<span className='absolute -top-6 text-[10px] font-mono text-teal-400 bg-slate-950 border border-slate-800 rounded px-1 opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap'>
										{hoursLabel}h
									</span>
									<div
										className={`w-full rounded-t-sm transition-all duration-500 min-h-[2px] ${
											mins > 0
												? 'bg-teal-500/80 group-hover/bar:bg-teal-400'
												: 'bg-slate-900'
										}`}
										style={{ height: `${heightPct}%` }}
									/>
									<span className='text-[11px] font-mono text-slate-500 group-hover/bar:text-slate-300 transition-colors'>
										{weekdayLabels[idx]}
									</span>
								</div>
							)
						})}
					</div>
				</section>
			</div>

			{/* Популярные теги (СТАТИЧНЫЕ — ЗА ВСЁ ВРЕМЯ) */}
			<section className='mb-8'>
				<h3 className='font-mono text-xs uppercase tracking-wider text-slate-500 mb-4'>
					{t('stats.tagsHeader')}
				</h3>
				{topTags.length === 0 ? (
					<p className='text-sm text-slate-600 italic'>{t('stats.noTags')}</p>
				) : (
					<div className='flex flex-wrap gap-2'>
						{topTags.map(tag => (
							<div
								key={tag.name}
								className='flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-md px-3 py-1.5 text-sm hover:border-slate-700 transition-colors'
							>
								<span className='text-teal-400 font-mono'>#{tag.name}</span>
								<span className='text-xs text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 font-mono'>
									{tag.count}
								</span>
							</div>
						))}
					</div>
				)}
			</section>

			{/* Календарь активности (GitHub-style: Сверху Пн, Снизу Вс, компактная ширина) */}
			<section className='pb-8 mt-8'>
				<h3 className='font-mono text-xs uppercase tracking-wider text-slate-500 mb-4'>
					{t('stats.activityHeader')}
				</h3>

				<div className='flex flex-col lg:flex-row gap-6 items-start'>
					{/* Календарь */}
					<div className='bg-slate-900/20 border border-slate-900/60 rounded-xl p-4 backdrop-blur-sm shadow-inner w-full lg:w-auto lg:shrink-0'>
						{/* Адаптивная верхняя панель с красивыми диапазонами дат */}
						<div className='flex justify-between items-center mb-4 text-[11px] font-mono text-slate-500 border-b border-slate-900 pb-2.5 select-none gap-4'>
							<span>
								{alignedStart
									? new Date(alignedStart).toLocaleDateString(undefined, {
											month: 'short',
											day: 'numeric',
										})
									: ''}
							</span>
							<div className='flex-1 max-w-[100px] h-[1px] bg-slate-800' />
							<span className='text-teal-500/80 font-medium tracking-wide text-[10px] uppercase whitespace-nowrap'>
								{t('stats.weeksRange', { count: 12 })}
							</span>
							<div className='flex-1 max-w-[100px] h-[1px] bg-slate-800' />
							<span>
								{new Date().toLocaleDateString(undefined, {
									month: 'short',
									day: 'numeric',
									year: 'numeric',
								})}
							</span>
						</div>

						<div className='flex gap-2.5 font-mono items-start'>
							{/* Левая колонка — Дни недели, адаптированные под i18n */}
							<div className='flex flex-col justify-between text-[10px] text-slate-500 pt-[1px] pb-[3px] pr-0.5 select-none text-right min-w-[18px] h-[112px] font-medium uppercase'>
								{['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(
									dayKey => (
										<span key={dayKey}>{t(`stats.days.${dayKey}`)}</span>
									),
								)}
							</div>

							{/* Сетка кубиков: 7 строк (дни), внутри каждой строки — ячейки недель */}
							<div
								className='flex-1 overflow-x-auto pb-1'
								style={{ scrollbarWidth: 'none' }}
							>
								<div className='flex flex-col gap-[4px] min-w-max'>
									{[0, 1, 2, 3, 4, 5, 6].map(dayIndex => (
										<div key={dayIndex} className='flex gap-[4px]'>
											{weeks.map((week, wi) => {
												const day = week[dayIndex]
												if (!day) return null

												// 1. Получаем текущую дату в формате YYYY-MM-DD
												const todayISO = new Date().toISOString().slice(0, 10)

												// 2. Находим реальный индекс сегодняшнего дня недели (где 0 - Пн, 6 - Вс)
												const currentJsDay = new Date().getDay()
												const currentDayIndex =
													currentJsDay === 0 ? 6 : currentJsDay - 1

												// 3. Проверяем, является ли эта неделя самой последней (текущей) в массиве
												const isLastWeek = wi === weeks.length - 1

												// 4. Логика скрытия: день будущий, если его дата строго больше сегодняшней,
												// ЛИБО если это текущая неделя, но строчка дня (dayIndex) ниже текущего дня
												const isFutureDay =
													day.date > todayISO ||
													(isLastWeek && dayIndex > currentDayIndex)

												// Если день еще не наступил, рендерим невидимую заглушку
												if (isFutureDay) {
													return (
														<div
															key={day.date}
															className='w-[12px] h-[12px] rounded-[2px] bg-transparent pointer-events-none shrink-0'
														/>
													)
												}

												// Красивый кастомный тултип даты при наведении для прошедших/текущих дней
												const formattedTooltipDate = new Date(
													`${day.date}T00:00:00`,
												).toLocaleDateString(undefined, {
													month: 'short',
													day: 'numeric',
													weekday: 'short',
												})

												const isSelected = day.date === selectedDay

												return (
													<button
														key={day.date}
														type='button'
														onClick={() =>
															setSelectedDay(prev =>
																prev === day.date ? null : day.date,
															)
														}
														title={`${formattedTooltipDate} · ${(day.minutes / 60).toFixed(1)}h`}
														className={`w-[12px] h-[12px] rounded-[2px] p-0 border-0 ${intensityClass(day.minutes)} transition-all duration-200 hover:scale-125 hover:ring-1 hover:ring-teal-400/60 cursor-pointer shrink-0 ${
															isSelected ? 'ring-2 ring-teal-300 scale-125' : ''
														}`}
													/>
												)
											})}
										</div>
									))}
								</div>
							</div>
						</div>

						{/* Легенда интенсивности */}
						<div className='flex items-center justify-end gap-1.5 mt-3 text-[10px] text-slate-500 font-mono border-t border-slate-900/60 pt-2.5 select-none'>
							<span>{t('stats.less')}</span>
							<span className='w-2.5 h-2.5 rounded-sm bg-slate-900' />
							<span className='w-2.5 h-2.5 rounded-sm bg-teal-950' />
							<span className='w-2.5 h-2.5 rounded-sm bg-teal-800' />
							<span className='w-2.5 h-2.5 rounded-sm bg-teal-600' />
							<span className='w-2.5 h-2.5 rounded-sm bg-teal-400' />
							<span>{t('stats.more')}</span>
						</div>
					</div>

					{/* Панель заметок за выбранный день */}
					<div className='flex-1 w-full min-w-0 bg-slate-900/20 border border-slate-900/60 rounded-xl p-4 backdrop-blur-sm shadow-inner flex flex-col'>
						<div className='flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-slate-900'>
							<h4 className='text-sm font-semibold text-slate-200 truncate'>
								{selectedDay
									? new Date(`${selectedDay}T00:00:00`).toLocaleDateString(
											undefined,
											{
												weekday: 'long',
												month: 'long',
												day: 'numeric',
												year: 'numeric',
											},
										)
									: t('stats.dayPanelTitle')}
							</h4>
							{selectedDay && (
								<span className='font-mono text-xs text-teal-400 bg-teal-950/30 px-2 py-0.5 rounded border border-teal-900/30 shrink-0'>
									{((minutesByDate[selectedDay] || 0) / 60).toFixed(1)}h
								</span>
							)}
						</div>

						{!selectedDay ? (
							<div className='flex-1 flex items-center justify-center text-center py-10'>
								<p className='text-sm text-slate-600 italic max-w-[240px]'>
									{t('stats.dayPanelEmptyHint')}
								</p>
							</div>
						) : selectedDayEntries.length === 0 ? (
							<div className='flex-1 flex items-center justify-center text-center py-10'>
								<p className='text-sm text-slate-600 italic'>
									{t('stats.dayPanelNoEntries')}
								</p>
							</div>
						) : (
							<div
								className='space-y-4 overflow-y-auto max-h-[420px] pr-1'
								style={{ scrollbarWidth: 'thin' }}
							>
								{selectedDayEntries.map(entry => {
									const project = projects.find(p => p.id === entry.projectId)
									return (
										<div
											key={entry.id}
											className='pb-4 border-b border-slate-900/60 last:border-0 last:pb-0'
										>
											<div className='flex items-center gap-2 flex-wrap mb-1.5'>
												{project && (
													<span className='flex items-center gap-1.5 text-xs font-medium text-slate-300'>
														<span
															className='w-2 h-2 rounded-full shrink-0'
															style={{ backgroundColor: project.color }}
														/>
														{project.name}
													</span>
												)}
												<span className='font-mono text-xs px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900'>
													+{formatDuration(entry.durationMinutes)}
												</span>
												{entry.tags?.map(tag => (
													<span
														key={tag}
														className='text-[11px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono'
													>
														#{tag}
													</span>
												))}
											</div>
											<div
												className='text-sm text-slate-300 leading-relaxed'
												dangerouslySetInnerHTML={{
													__html: renderMarkdown(
														entry.text,
														t('logEditor.emptyPreview'),
													),
												}}
											/>
										</div>
									)
								})}
							</div>
						)}
					</div>
				</div>
			</section>
		</div>
	)
}

function StatCard({ label, value }) {
	return (
		<div className='bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors'>
			<p className='text-xs text-slate-500 mb-1 truncate'>{label}</p>
			<p className='font-mono text-2xl font-semibold text-slate-100'>{value}</p>
		</div>
	)
}
