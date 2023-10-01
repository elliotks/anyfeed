import { json } from '@sveltejs/kit'
import { getLastFeed, deleteFeedId, type FeedDataWithId, updateFeed } from '$lib/db'

export async function GET({ url }) {
	try {
		const sourceIds = url.searchParams.get('sourceIds')
		if (!sourceIds) throw new Error('The sourceIds are required')

		const last = parseInt(url.searchParams.get('last') || '0')
		const limit = parseInt(url.searchParams.get('limit') || '10')
		const filter = url.searchParams.get('filter') || undefined

		const ids = sourceIds.split(',').map((id) => parseInt(id))
		const lastFeed = await getLastFeed({ sourceIds: ids, last, limit, filter })

		return json(lastFeed, { status: 201 })
	} catch (error) {
		return json(error, { status: 500 })
	}
}

export async function PUT({ request }) {
	const { feedData }: { feedData: FeedDataWithId } = await request.json()

	try {
		await updateFeed(feedData)

		return json(undefined, { status: 201 })
	} catch (error) {
		console.log(error)
		return json(error, { status: 500 })
	}
}

export async function DELETE({ url }) {
	try {
		const id = url.searchParams.get('id')
		if (!id) throw new Error('The id is required')

		await deleteFeedId(parseInt(id))

		return json(undefined, { status: 204 })
	} catch (error) {
		return json(error, { status: 500 })
	}
}
