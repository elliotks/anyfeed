import { json } from '@sveltejs/kit'
import jobFinder, { status as finderStatus } from '$lib/cron/jobFinder'
import JobRunner, { status as runnerStatus } from '$lib/cron/jobRunner'
import dayjs from 'dayjs'

// get status of jobFinder and jobRunner
export async function GET() {
	return json(
		{
			finder: finderStatus(),
			runner: runnerStatus(),
			time: dayjs(Date.now()).format('YYYY/MM/DD HH:mm')
		},
		{ status: 200 }
	)
}

// run jobFinder and jobRunner
export async function POST() {
	jobFinder()
	JobRunner()

	return json(undefined, { status: 204 })
}
