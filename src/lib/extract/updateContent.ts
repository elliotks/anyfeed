import playwright from 'playwright'
import findRepetitivePatterns from './findRepetitivePatterns'
import getMeta from './getMeta'
// @ts-ignore
import { extract } from '@extractus/feed-extractor'
import {
	getSource,
	getUser,
	getLastFeed,
	createFeed,
	type FeedData,
	deleteFeedsFromSource,
	type FeedDataWithId
} from '../db'
import { getRecipe } from './utils'

export default async function (sourceId: number) {
	const sourceData = await getSource(sourceId).catch((_) => null)

	let list: string[] = []

	if (sourceData) {
		if (sourceData.rss) {
			const result = await extract(sourceData.rss)
			if (result?.entries?.length) {
				const urls = result.entries.map((entry) => entry.link)
				list.push(...(urls as string[]))
			}
		}

		const browser = await playwright.chromium.launch({
			headless: true
		})

		if (!list.length) {
			const page = await browser.newPage()
			await page.goto(sourceData.url)

			const checkTempRecipe = getRecipe(page.url())
			if (checkTempRecipe?.run) await checkTempRecipe.run(page)

			const result = await page.evaluate(findRepetitivePatterns, sourceData.xpath)
			page.close()

			// remove the first element which is the xpath
			list.push(...(result[0].slice(1) as string[]))
		}

		list = [...new Set(list)]

		// we keep only the first maxLastFeedPerSource links
		const user = await getUser()
		const slicedList = list.slice(0, sourceData.maxLastFeed || user.maxLastFeedPerSource)

		// we remove the links that are already in the database
		const lastFeeds = await getLastFeed({
			sourceIds: [sourceId],
			last: 0,
			limit: sourceData.maxLastFeed || user.maxLastFeedPerSource,
			emptyLinks: true
		})
		const filteredList = slicedList
			.filter((url) => !lastFeeds.find((lastFeed) => lastFeed.url == url))
			.reverse()

		const feed: FeedData[] = []
		const feedWithId: FeedDataWithId[] = []

		const recipe = getRecipe(filteredList[0])

		// create an array of promises that resolve to the feed data
		const promises = filteredList.map(async (url) => {
			try {
				const page = await browser.newPage()
				await page.goto(url)

				const checkTempRecipe = getRecipe(page.url())
				if (checkTempRecipe?.run) await checkTempRecipe.run(page)

				const html = await page.content()

				let custom: {
					image?: string | null
					title?: string
					description?: string
				} = {}

				let image
				let description

				if (recipe) {
					let title

					if (recipe.image) image = await recipe.image(page)
					if (recipe.title) title = await recipe.title(page)
					if (recipe.description) description = await recipe.description(page)

					custom = {
						...(image && { image }),
						...(title && { title }),
						...(description && { description })
					}
				}

				await page.close()

				const metadata = { ...(await getMeta({ html, url })), ...custom }
				if (image === null) metadata.image = null
				if (description === null) metadata.description = null

				const feedData = {
					title: metadata.title || null,
					description: metadata.description || null,
					image: metadata.image || null,
					sourceId,
					url,
					bookmark: false
				}

				return feedData
			} catch (err) {
				console.error(`Error processing URL ${url}: ${err}`)
			}
		})

		const results = (await Promise.all(promises)) as FeedData[]

		results
			.sort((a, b) => {
				const indexA = filteredList.indexOf(a.url)
				const indexB = filteredList.indexOf(b.url)
				return indexA - indexB
			})
			.forEach((result) => {
				feed.push(result)
			})

		for (const item of feed) {
			try {
				const dataWithId = await createFeed(item)
				feedWithId.push(dataWithId)
			} catch (error) {
				console.error(error)
			}
		}

		// TODO: Handle when we need to reload the feed on the front side
		deleteFeedsFromSource(sourceData.id, sourceData.maxTotalFeed || user.maxTotalFeedPerSource)

		await browser.close()

		return feedWithId.reverse()
	}

	return null
}
