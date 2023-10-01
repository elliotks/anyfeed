import { Op } from 'sequelize'
import { db } from './db'

export interface JobHistorydData {
	status: string
	sourceId: number
}

export interface JobHistorydDataWithId extends JobHistorydData {
	id: number
	createdAt: string
	updatedAt: string
}

export async function createJobHistory(data: JobHistorydData): Promise<JobHistorydDataWithId> {
	const jobHistory = await db?.models.jobHistory.create(data as never)
	if (!jobHistory) throw new Error("The job history couldn't be created.")

	return jobHistory?.dataValues
}

export async function getLastJobHistory(options: {
	sourceIds?: number[]
	last?: number
	status?: string
	limit?: number
	asc?: boolean
}): Promise<JobHistorydDataWithId[]> {
	// eslint-disable-next-line prefer-const
	let { sourceIds, last, status, limit, asc } = options

	if (!limit) limit = 50

	const whereClause: any = {}

	if (sourceIds && sourceIds.length > 0) {
		const sourceIdObjs = sourceIds.map((id) => ({ sourceId: id }))
		whereClause[Op.or] = sourceIdObjs
	}

	if (last) {
		whereClause.id = { [Op.lt]: last }
	}

	if (status) {
		whereClause.status = status
	}

	const jobHistory = await db?.models.jobHistory.findAll({
		where: whereClause,
		order: [['createdAt', asc ? 'ASC' : 'DESC']],
		limit
	})

	return jobHistory?.map((e) => e.dataValues) || []
}

export async function deleteJobHistoryFromSource(sourceId: number): Promise<void> {
	await db?.models.jobHistory.destroy({
		where: {
			sourceId
		}
	})
}

export async function deleteJobHistory(limit: number): Promise<void> {
	const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

	const jobHistory = await db?.models.jobHistory.findAll({
		where: {
			[Op.or]: [
				{
					status: {
						[Op.notIn]: ['scheduled', 'running']
					}
				},
				{
					createdAt: {
						[Op.lt]: twentyFourHoursAgo
					}
				}
			]
		},
		order: [['createdAt', 'DESC']],
		limit
	})

	const jobHistoryIds = jobHistory?.map((e) => e.dataValues.id) || []

	await db?.models.jobHistory.destroy({
		where: {
			id: {
				[Op.notIn]: jobHistoryIds
			}
		}
	})
}

export async function updateJobHistory(
	data: JobHistorydDataWithId
): Promise<JobHistorydDataWithId> {
	const jobHistory = await db?.models.jobHistory.findByPk(data.id)
	if (!jobHistory) throw new Error("The specified job history doesn't exist.")

	const updatedJobHistory = await jobHistory.update(data)
	return updatedJobHistory.dataValues
}
