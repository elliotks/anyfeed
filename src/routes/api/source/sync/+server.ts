import { json } from '@sveltejs/kit'
import update from '$lib/extract/updateContent'

export async function POST({ request }) {
	const { sourceId }: { sourceId: number } = await request.json()
	if (!sourceId) throw new Error('The sourceId is required')

	try {
		const res = await update(sourceId)
		return json(res || [], { status: 201 })
	} catch (error) {
		console.log(error)
		return json(error, { status: 500 })
	}
}
