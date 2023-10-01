import { getAllSources, type SourceDataWithId } from '../db'

export let jobs: SourceDataWithId[] = []

export async function updateJobs() {
	const sources = await getAllSources()
	if (sources) jobs = sources
}
