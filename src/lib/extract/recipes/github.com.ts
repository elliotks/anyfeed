import type { Page } from 'playwright'

export default {
	'/': {
		logo: async (page: Page) => {
			const author = await page.locator('.author > a').first().getAttribute('href', {
        timeout: 100
      }).catch(() => null)
			if (author) {
				await page.goto(`https://github.com/${author}`)
				const logo = (await page.locator('.avatar').first().getAttribute('src')) || ''
        await page.goBack()
        return logo
			}
			return ''
		},

    name: async (page: Page) => {
      return (await page.locator('[itemprop="name"] > a').first().textContent({
        timeout: 100
      }).catch(() => null)) || ''
    }
	}
}
