import { json } from '@sveltejs/kit'
import { getLastJobHistory } from '$lib/db'

export async function GET({ url }) {
	try {
		const last = url.searchParams.get('last')

		const lastJobHistory = await getLastJobHistory({
			...(last && { last: parseInt(last) })
		})

		return json(lastJobHistory, { status: 200 })
	} catch (error) {
		return json(error, { status: 500 })
	}
}
