import parser from 'cron-parser'
import { jobs, updateJobs } from './jobs'
import { getUser, createJobHistory } from '../db'

let interval: ReturnType<typeof setInterval> | null = null
let last = 0

export function status() {
	return last > Date.now() - 1000 * 90
}

export default async function () {
	if (interval) {
		clearInterval(interval)
	}

	await getUser()
	await updateJobs()

	last = Date.now()

	interval = setInterval(() => {
		last = Date.now()

		const jobsToRun = jobs.filter((job) => {
			if (!job.cron) return false

			const interval = parser.parseExpression(job.cron)
			const prev = interval.prev()
			const next = interval.next()
			const now = new Date()
			now.setSeconds(0, 0)
			const timestamp = now.getTime()

			return prev.getTime() === timestamp || next.getTime() === timestamp
		})

		jobsToRun.forEach((job) => {
			createJobHistory({
				sourceId: job.id,
				status: 'scheduled'
			})
		})
	}, 1000 * 60)
}
