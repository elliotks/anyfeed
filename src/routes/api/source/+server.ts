import { json } from '@sveltejs/kit'
import {
	createSource,
	updateSource,
	deleteSource,
	type SourceDataWithId,
	type SourceData
} from '$lib/db'
import type { Meta } from '$lib/extract/getMeta'

export async function POST({ request }) {
	const {
		sourceData,
		feedPreview,
		urls
	}: { sourceData: SourceData; feedPreview: Meta; urls: string[] } = await request.json()

	try {
		await createSource(sourceData, feedPreview, urls)

		return json(undefined, { status: 201 })
	} catch (error) {
		return json(error, { status: 500 })
	}
}

export async function PUT({ request }) {
	const { sourceData }: { sourceData: SourceDataWithId } = await request.json()

	try {
		if (!sourceData.userId) throw new Error('The userId is required')
		await updateSource(sourceData)

		return json(undefined, { status: 201 })
	} catch (error) {
		console.log(error)
		return json(error, { status: 500 })
	}
}

export async function DELETE({ request }) {
	const { sourceData }: { sourceData: SourceDataWithId } = await request.json()

	try {
		if (!sourceData.userId) throw new Error('The userId is required')

		await deleteSource(sourceData.id)

		return json(undefined, { status: 204 })
	} catch (error) {
		console.log(error)
		return json(error, { status: 500 })
	}
}
