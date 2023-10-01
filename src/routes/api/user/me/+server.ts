import { json } from '@sveltejs/kit'
import { updateUser, type UserData } from '$lib/db'

export async function PUT({ request }) {
	const { userData }: { userData: UserData } = await request.json()

	try {
		await updateUser(userData)
		return json(undefined, { status: 201 })
	} catch (error) {
		console.log(error)
		return json(error, { status: 500 })
	}
}
