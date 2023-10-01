import {
	getLastJobHistory,
	updateJobHistory,
	deleteJobHistory,
	getUser,
	type JobHistorydDataWithId
} from '../db'
import update from '../extract/updateContent'

let interval: ReturnType<typeof setInterval> | null = null
let getting = false
let running = false
let last = 0

export function status() {
	return last > Date.now() - 1000 * 90
}

async function runJob(scheduledJob: JobHistorydDataWithId, limit: number) {
	running = true
	await updateJobHistory({ ...scheduledJob, status: 'running' })
	const res = await update(scheduledJob.sourceId)
	await updateJobHistory({ ...scheduledJob, status: !res ? 'failed' : `completed: ${res.length}` })
	running = false
	getOlderJob(limit, true)
}

async function getOlderJob(limit: number, invokeDeleteJobHistory: boolean) {
	if (getting || running) return
	getting = true

	const scheduledJobs = await getLastJobHistory({
		status: 'scheduled',
		limit: 1,
		asc: true
	})

	if (scheduledJobs.length) {
		runJob(scheduledJobs[0], limit)
		getting = false
	} else {
		if (invokeDeleteJobHistory) await deleteJobHistory(limit)
		getting = false
	}
}

export default function () {
	if (interval) {
		clearInterval(interval)
	}

	last = Date.now()

	interval = setInterval(async () => {
		last = Date.now()
		if (getting || running) return

		const user = await getUser()
		getOlderJob(user.maxJobHistory, false)
	}, 1000 * 60)
}
