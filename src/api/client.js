const BASE_URL = 'http://localhost:5000' // Адрес, где запущен Python-бэкенд

// ---------------------------------------------------------------------------
// СТАТУС ЭНДПОИНТОВ (на конец спринта, по routes/projects.py и entry.py):
//
//   ✅ GET    /api/projects            — есть
//   ✅ POST   /api/projects            — есть
//   ❌ PUT    /api/projects/<id>       — НЕТ на бэке, нужно добавить в projects.py
//   ❌ DELETE /api/projects/<id>       — НЕТ на бэке, нужно добавить в projects.py
//   ❌ GET    /api/projects/<id>/entries — НЕТ. routes/entries.py вообще не создан
//   ❌ POST   /api/entries             — НЕТ
//   ❌ PUT    /api/entries/<id>        — НЕТ
//   ❌ DELETE /api/entries/<id>        — НЕТ
//
// Функции ниже для отсутствующих роутов написаны в расчёте на то, что
// бэкенд будет реализован по аналогии с /api/projects (тот же стиль,
// тот же формат ошибок). Пока роута нет — fetch вернёт 404, и функция
// бросит понятную ошибку с адресом, чего не хватает, вместо тихого сбоя
// где-то в глубине компонента.
// ---------------------------------------------------------------------------

/**
 * Модель Entry на бэкенде НЕ имеет поля tags (см. app/models/entry.py).
 * Фронт (LogEditor.jsx) использует entry.tags. Пока бэкенд не добавит
 * колонку, теги при сохранении/чтении с сервера теряются — normalizeEntry
 * подставляет пустой массив, а denormalizeEntry просто отбрасывает tags,
 * чтобы это было явно видно, а не терялось незаметно.
 */
const ENTRY_TAGS_SUPPORTED_ON_BACKEND = false

async function request(path, options = {}) {
	let response
	try {
		response = await fetch(`${BASE_URL}${path}`, {
			headers: { 'Content-Type': 'application/json' },
			...options,
		})
	} catch (error) {
		// Сеть недоступна / бэкенд не запущен / CORS.
		// cause привязан по стандарту Error, а не просто упомянут в тексте —
		// так стектрейс/девтулы видят исходную причину, а не только сообщение.
		throw new Error(
			`Не удалось достучаться до ${BASE_URL}${path}. Бэкенд запущен? CORS настроен (flask-cors)?`,
			{ cause: error },
		)
	}

	if (response.status === 404) {
		throw new Error(
			`404: эндпоинт ${options.method || 'GET'} ${path} не найден на бэкенде. Скорее всего, роут ещё не реализован — см. комментарий в шапке client.js.`,
		)
	}

	if (!response.ok) {
		// Пытаемся вытащить { "error": "..." } из тела ответа, как это
		// делает projects.py при 400
		let message = `Ошибка ${response.status} на ${path}`
		try {
			const body = await response.json()
			if (body?.error) message = body.error
		} catch {
			// тело не JSON — оставляем общее сообщение
		}
		throw new Error(message)
	}

	// 204 No Content (типично для DELETE) — тела не будет
	if (response.status === 204) return null

	return response.json()
}

// --- Проекты ---------------------------------------------------------------
// Бэкенд отдаёт поля as-is (name, color, description, created_at) —
// они уже совпадают по названию с фронтом, маппинг не нужен.

export const getProjects = async () => {
	return request('/api/projects')
}

export const createProject = async ({ name, color, description }) => {
	return request('/api/projects', {
		method: 'POST',
		body: JSON.stringify({ name, color, description }),
	})
}

// ⚠️ Не реализовано на бэкенде — нужно добавить
// @projects_bp.route('/api/projects/<int:project_id>', methods=['PUT'])
export const updateProject = async (
	projectId,
	{ name, color, description },
) => {
	return request(`/api/projects/${projectId}`, {
		method: 'PUT',
		body: JSON.stringify({ name, color, description }),
	})
}

// ⚠️ Не реализовано на бэкенде — нужно добавить
// @projects_bp.route('/api/projects/<int:project_id>', methods=['DELETE'])
export const deleteProject = async projectId => {
	return request(`/api/projects/${projectId}`, { method: 'DELETE' })
}

// --- Записи (Entry) ---------------------------------------------------------
// Бэкенд отдаёт project_id / duration_min (snake_case), фронт всюду
// использует projectId / durationMinutes (camelCase) — конвертируем на границе.

function normalizeEntry(raw) {
	return {
		id: raw.id,
		projectId: raw.project_id,
		date: raw.date,
		durationMinutes: raw.duration_min,
		text: raw.content ?? '',
		// поля tags на бэкенде нет — отдаём пустой массив, а не undefined,
		// чтобы entry.tags?.map(...) на фронте не падал
		tags: [],
	}
}

function denormalizeEntry(entry) {
	const payload = {
		project_id: entry.projectId,
		date: entry.date,
		duration_min: entry.durationMinutes,
		content: entry.text,
	}
	if (!ENTRY_TAGS_SUPPORTED_ON_BACKEND && entry.tags?.length) {
		console.warn(
			'[client.js] entry.tags указаны, но бэкенд их не хранит (нет колонки в модели Entry) — теги будут потеряны при сохранении на сервер.',
		)
	}
	return payload
}

// ⚠️ Не реализовано на бэкенде — нужен routes/entries.py, например:
// @entries_bp.route('/api/projects/<int:project_id>/entries', methods=['GET'])
export const getEntries = async projectId => {
	const raw = await request(`/api/projects/${projectId}/entries`)
	return raw.map(normalizeEntry)
}

// ⚠️ Не реализовано на бэкенде — нужен
// @entries_bp.route('/api/entries', methods=['POST'])
export const createEntry = async entry => {
	const raw = await request('/api/entries', {
		method: 'POST',
		body: JSON.stringify(denormalizeEntry(entry)),
	})
	return normalizeEntry(raw)
}

// ⚠️ Не реализовано на бэкенде — нужен
// @entries_bp.route('/api/entries/<int:entry_id>', methods=['PUT'])
export const updateEntry = async (entryId, entry) => {
	const raw = await request(`/api/entries/${entryId}`, {
		method: 'PUT',
		body: JSON.stringify(denormalizeEntry(entry)),
	})
	return normalizeEntry(raw)
}

// ⚠️ Не реализовано на бэкенде — нужен
// @entries_bp.route('/api/entries/<int:entry_id>', methods=['DELETE'])
export const deleteEntry = async entryId => {
	return request(`/api/entries/${entryId}`, { method: 'DELETE' })
}
