import { json } from '@sveltejs/kit'
import findContent from '$lib/extract/findContent'

export async function POST({ request }) {
	try {
		const { url, xpath, maxLastFeed } = await request.json()
		const data = await findContent(url, xpath || '', maxLastFeed)
		return json(data, { status: 201 })
	} catch (e) {
		return json({ error: (e as Error).message }, { status: 500 })
	}
}
