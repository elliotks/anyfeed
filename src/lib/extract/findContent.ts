import playwright from 'playwright'
import findRepetitivePatterns from '$lib/extract/findRepetitivePatterns'
import getMeta from '$lib/extract/getMeta'
// @ts-ignore
import rssFinder from 'robust-rss-finder'
import { extract } from '@extractus/feed-extractor'
import { getRecipe } from '$lib/extract/utils'

export default async function (url: string, xpath: string, maxLastFeed: number) {
	const lists: string[][] = []
	let realUrl = ''
	let logoAndName = {}
	let rss

	let recipe = getRecipe(url)

	if (!xpath && !recipe?.xpathOrSelector && !url.match('producthunt.com')) {
		// we check first if there is any rss feed
		const timeout = 10000
		const rssPromise = rssFinder(recipe?.rss ? recipe.rss(url) : url)
		const timeoutPromise = new Promise((_, reject) =>
			setTimeout(() => reject(new Error('Request timed out')), timeout)
		)
		rss = await Promise.race([rssPromise, timeoutPromise]).catch(() => null)

		if (rss && rss.feedUrls.length) {
			const result = await extract(rss.feedUrls[0].url).catch(() => null)
			if (result?.entries?.length) {
				if (rss.site?.url) realUrl = rss.site.url
				const urls = result.entries.map((entry) => entry.link)
				lists.push([rss.feedUrls[0].url, ...urls])
			}
		}
	}

	const browser = await playwright.chromium.launch({
		headless: true
	})

	const page = await browser.newPage()

	if (!rss || (rss && realUrl) || recipe?.logo || recipe?.name) {
		await page.goto(realUrl || url)
		const html = await page.content()

		const checkTempRecipe = getRecipe(page.url())
		if (checkTempRecipe?.run) await checkTempRecipe.run(page)

		if (html.match('https://cdn-client.medium.com/')) recipe = getRecipe('.medium.com/')
		else recipe = getRecipe(realUrl || url)

		if (recipe) {
			let logo
			let name

			if (recipe.logo) logo = await recipe.logo(page)
			if (recipe.name) name = await recipe.name(page)

			logoAndName = {
				...(logo && { logo }),
				...(name && { name })
			}
		} else {
			const meta = await getMeta({ html, url: realUrl || url })

			logoAndName = {
				...(meta.logo && { logo: meta.logo }),
				...(meta.name && { name: meta.name })
			}
		}
	}

	if (!lists.length) {
		if (rss && !realUrl) {
			await page.goto(url)

			const checkTempRecipe = getRecipe(page.url())
			if (checkTempRecipe?.run) await checkTempRecipe.run(page)
		}

		const xpathOrSelector =
			!xpath && recipe?.xpathOrSelector ? (await recipe.xpathOrSelector(page)) || '' : ''

		lists.push(...(await page.evaluate(findRepetitivePatterns, xpath || xpathOrSelector)))
	}

	let metadata

	if (lists.length) {
		const url = lists[0][1]
		if (!url) return { metadata: null }

		await page.goto(url)

		const checkTempRecipe = getRecipe(page.url())
		if (checkTempRecipe?.run) await checkTempRecipe.run(page)

		const html = await page.content()

		recipe = getRecipe(url)
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

		metadata = { ...(await getMeta({ html, url })), ...logoAndName, ...custom }
		if (image === null) metadata.image = null
		if (description === null) metadata.description = null
	}

	await browser.close()

	const path = lists.length ? lists[0][0] : ''
	let urls = lists.length ? lists[0] : []
	urls.shift()
	urls = [...new Set(urls)]
	urls.splice(maxLastFeed)

	return {
		path,
		metadata,
		urls,
		...(realUrl && { realUrl })
	}
}
