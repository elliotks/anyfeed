import type { Page } from 'playwright'
import { textExtractFrom } from '../utils'

export default {
	'^/r/[a-z0-9]+/$': {
		regex: true,

		xpathOrSelector: async (page: Page) => {
			await page.mouse.wheel(0, 1000)
			await page
				.waitForLoadState('networkidle', {
					timeout: 5000
				})
				.catch(() => null)

			return 'shreddit-post'
		},

		logo: async (page: Page) => {
			return (
				(await page.locator('.shreddit-subreddit-icon__icon').first().getAttribute('src')) || ''
			)
		},

		name: async (page: Page) => {
			const name = await page.locator('shreddit-subreddit-header').first().getAttribute('name')
			return 'r/' + name
		}
	},

	'^/r/[a-z0-9]+/comments/': {
		regex: true,

		title: async (page: Page) => {
			const title = (await page.locator('title').first().textContent()) || ''
			return title.replace(/:.+$/, '').trim()
		},

		description: async (page: Page) => {
			return await page.evaluate(textExtractFrom, '[slot=text-body]')
		},

		image: () => {
			return null
		}
	},

	'/search/': {
		xpathOrSelector: () => '[data-testid="post-title"]'
	}
}
