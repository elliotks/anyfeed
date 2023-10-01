import type { Page } from 'playwright'

export default {
	'/': {
		run: async (page: Page) => {
			await page
				.click('button.accept-all', {
					timeout: 100
				})
				.catch(() => null)
			await page.waitForLoadState('networkidle', {
				timeout: 1000
			}).catch(() => null)
		}
	}
}
