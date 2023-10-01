import { getUser, getAllSources } from '$lib/db'

export const ssr = false

export async function load() {
	const user = await getUser()
	const sources = await getAllSources(user.id)

	return {
		user,
		sources
	}
}
