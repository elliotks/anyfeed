import type { Meta } from '../extract/getMeta'
import type { AvatarData } from '../../components/common/avatar.types'
import { updateJobs } from '../cron/jobs'
import { db } from './db'
import { createFeed, deleteFeedsFromSource } from './feed'
import { deleteJobHistoryFromSource } from './jobHistory'
import { getUser, updateUser } from './user'

export interface SourceData {
	userId: number
	name: string
	url: string
	xpath: string
	rss: string
	avatar: AvatarData
	cron: string | null
	maxLastFeed: number | null
	maxTotalFeed: number | null
	displayOnHome: boolean
}

export interface SourceDataWithId extends SourceData {
	id: number
}

export async function createSource(
	sourceData: SourceData,
	feedPreview: Meta,
	urls: string[]
): Promise<SourceDataWithId> {
	// save source
	if (!sourceData.userId) throw new Error('The userId is required')
	const source = await db?.models.source.create(sourceData as never)
	if (!source) throw new Error("The source couldn't be created.")

	updateJobs()

	// we push the sourceId to the user.navOrder
	const user = await getUser()
	await updateUser({
		...user,
		navOrder: user.navOrder ? `${user.navOrder},${source.dataValues.id}` : `${source.dataValues.id}`
	})

	const feeds = []

	// save each urls, the first one with the metadata
	for (const [index, url] of urls.entries()) {
		const feedData = {
			...(index === 0
				? {
						title: feedPreview.title || null,
						description: feedPreview.description || null,
						image: feedPreview.image || null
				  }
				: {
						title: null,
						description: null,
						image: null
				  }),
			sourceId: source.dataValues.id,
			url,
			bookmark: false
		}

		feeds.unshift(feedData)
	}

	for (const feed of feeds) {
		await createFeed(feed).catch(() => null)
	}

	return source.dataValues
}

export async function getSource(id: number): Promise<SourceDataWithId> {
	const source = await db?.models.source.findByPk(id)
	if (!source) throw new Error("The specified source doesn't exist.")

	return source.dataValues
}

export async function updateSource(data: SourceDataWithId): Promise<SourceDataWithId> {
	const source = await db?.models.source.findByPk(data.id)
	if (!source) throw new Error("The specified source doesn't exist.")

	const user = await getUser()

	if (
		data.maxTotalFeed &&
		data.maxTotalFeed < (source.dataValues.maxTotalFeed || user.maxLastFeedPerSource)
	) {
		deleteFeedsFromSource(data.id, data.maxTotalFeed)
	}

	const updatedSource = await source.update(data)
	updateJobs()
	return updatedSource.dataValues
}

export async function deleteSource(id: number): Promise<void> {
	const source = await db?.models.source.findByPk(id)
	if (!source) throw new Error("The specified source doesn't exist.")

	await deleteJobHistoryFromSource(id)
	await deleteFeedsFromSource(id)

	await source.destroy()

	// remove sourceData.id from user.navOrder
	const userData = await getUser()

	const navOrder =
		userData.navOrder
			?.split(',')
			.filter((sourceId) => sourceId !== id.toString())
			.join(',') || null

	updateUser({ ...userData, navOrder })

	updateJobs()
}

export async function getAllSources(userId?: number): Promise<SourceDataWithId[]> {
	const sources = await db?.models.source.findAll({
		...(userId
			? {
					where: {
						userId
					}
			  }
			: {})
	})

	return (
		sources?.map((source) => {
			source.dataValues.avatar = JSON.parse(source.dataValues.avatar)
			return source.dataValues
		}) || []
	)
}
