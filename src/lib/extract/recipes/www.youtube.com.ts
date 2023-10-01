import type { Page } from 'playwright'

export default {
	'^/(@|channel/)': {
		regex: true,

		logo: async (page: Page) => {
			return (await page.locator('#avatar #img').first().getAttribute('src')) || ''
		},

		name: async (page: Page) => {
			return (
				(await page.locator('ytd-channel-name yt-formatted-string').first().textContent()) || ''
			)
		}
	}
}
