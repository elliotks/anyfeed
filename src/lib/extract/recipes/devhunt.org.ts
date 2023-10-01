import type { Page } from 'playwright'

export default {
	'/': {
		regex: true,

		xpathOrSelector: async (page: Page) => {
			await page.mouse.wheel(0, 1000)
			await page
				.waitForLoadState('networkidle', {
					timeout: 5000
				})
				.catch(() => null)

			return 'body > main > section > div.mt-10.mb-12 > ul:nth-child(3) > li'
		}
	}
}
