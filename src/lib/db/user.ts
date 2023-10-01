import { db } from './db'
import { getAllSources } from './source'
import { deleteFeedsFromSource } from './feed'
import { deleteJobHistory } from './jobHistory'

export interface UserData {
	id: number
	userName: string | null
	swipeUI: boolean
	maxLastFeedPerSource: number
	maxTotalFeedPerSource: number
	maxJobHistory: number
	navOrder: string | null
	showSourcesStarter: boolean
}

export async function getUser(): Promise<UserData> {
	const res = await db?.models.user.findOne()
	if (res) return res.dataValues

	const created = await db?.models.user.create()
	return created?.dataValues
}

export async function updateUser(data: UserData): Promise<UserData> {
	const user = await db?.models.user.findByPk(data.id)
	if (!user) throw new Error("The specified user doesn't exist.")

	// check if user.dataValues.maxLastFeedPerSource is less than data.maxTotalFeedPerSource
	if (data.maxTotalFeedPerSource < user.dataValues.maxTotalFeedPerSource) {
		const sources = await getAllSources(data.id)

		const promises = sources.map((source) =>
			deleteFeedsFromSource(source.id, data.maxTotalFeedPerSource)
		)

		await Promise.all(promises)
	}

	// check if user.dataValues.maxHistory is less than data.maxHistory
	if (data.maxJobHistory < user.dataValues.maxJobHistory) {
		await deleteJobHistory(data.maxJobHistory)
	}

	const updatedUser = await user.update(data)
	return updatedUser.dataValues
}
