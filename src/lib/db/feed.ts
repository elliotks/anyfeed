import { Op } from 'sequelize'
import { db } from './db'

export interface FeedData {
	sourceId: number
	url: string
	title: string | null
	description: string | null
	image: string | null
	bookmark: boolean
}

export interface FeedDataWithId extends FeedData {
	id: number
	createdAt: string
}

export async function createFeed(data: FeedData): Promise<FeedDataWithId> {
	const feed = await db?.models.feed.create(data as never)
	if (!feed) throw new Error("The feed couldn't be created.")

	return feed?.dataValues
}

export async function getLastFeed(options: {
	sourceIds: number[]
	last: number
	limit?: number
	emptyLinks?: boolean
	filter?: string
}): Promise<FeedDataWithId[]> {
	// eslint-disable-next-line prefer-const
	let { sourceIds, last, limit, emptyLinks, filter } = options

	const sourceIdObjs = sourceIds.map((id) => ({ sourceId: id }))
	if (!limit) limit = 10

	let whereClause: any = {
		[Op.or]: sourceIdObjs,
		[Op.and]: {
			...(filter === 'Starred' && { bookmark: true }),
			[Op.or]: [
				{ title: { [Op.not]: null } },
				{ description: { [Op.not]: null } },
				{ image: { [Op.not]: null } }
			]
		}
	}

	if (last !== 0) {
		whereClause = {
			...whereClause,
			id: { [Op.lt]: last }
		}
	}

	const feed = await db?.models.feed.findAll({
		where: emptyLinks ? { [Op.or]: sourceIdObjs } : whereClause,
		order: [['createdAt', 'DESC']],
		limit
	})

	return feed?.map((e) => e.dataValues) || []
}

export async function updateFeed(data: FeedDataWithId): Promise<FeedDataWithId> {
	const feed = await db?.models.feed.findByPk(data.id)
	if (!feed) throw new Error("The specified feed doesn't exist.")

	const updatedFeed = await feed.update(data)
	return updatedFeed.dataValues
}

export async function deleteFeedsFromSource(sourceId: number, limit?: number): Promise<void> {
	if (limit) {
		// delete all feeds from sourceId except the last limit feeds
		const feed = await db?.models.feed.findAll({
			where: {
				sourceId
			},
			order: [['createdAt', 'DESC']],
			limit
		})

		const feedIds = feed?.map((e) => e.dataValues.id) || []

		await db?.models.feed.destroy({
			where: {
				id: {
					[Op.notIn]: feedIds
				},
				sourceId
			}
		})
	} else {
		await db?.models.feed.destroy({
			where: {
				sourceId
			}
		})
	}
}

export async function deleteFeedId(id: number): Promise<void> {
	const feed = await db?.models.feed.findOne({
		where: {
			id
		}
	})

	if (!feed) throw new Error("The feed couldn't be found.")

	// We don't really delete it (we need to store the url so we don't save it twice on the next sync), we just remove the data
	feed.update({ title: null, description: null, image: null, bookmark: false })
}
