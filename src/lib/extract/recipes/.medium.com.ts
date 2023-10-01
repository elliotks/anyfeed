import type { Page } from 'playwright'

export default {
	'/': {
		regex: true,

		logo: async (page: Page) => {
			return (
				(await page
					.locator('img[width="88"]')
					.first()
					.getAttribute('src', { timeout: 100 })
					.catch(() => null)) || ''
			)
		},

		name: async (page: Page) => {
			return (
				(await page
					.locator('.pw-author-name span')
					.first()
					.textContent({ timeout: 100 })
					.catch(() => null)) || ''
			)
		}
	}
}
