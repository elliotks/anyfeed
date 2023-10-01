import type { Page } from 'playwright'

export default {
	'/papers': {
		xpathOrSelector: () => {
			return 'article h3 a'
		},

		description: () => null
	},

	'/models': {
		xpathOrSelector: () => {
			return 'article a'
		},

		description: () => null
	},

	'/spaces': {
		xpathOrSelector: () => {
			return 'article a'
		},

    description: () => null
	},

	'/blog': {},

	'^/[a-z0-9-_]+$': {
		regex: true,

		logo: async (page: Page) => {
			return (
				(await page
					.locator('img[alt$="picture"]')
					.first()
					.getAttribute('src', {
						timeout: 100
					})
					.catch(() => null)) || ''
			)
		},

		name: async (page: Page) => {
			return (
				(await page
					.locator('meta[property="og:title"]')
					.first()
					.getAttribute('content', {
						timeout: 100
					})
					.catch(() => null)) || ''
			)
		},

		xpathOrSelector: () => {
			return '#models article'
		}
	},

	'^/[a-z0-9-_]+/[a-z0-9-_]+/discussions': {
		regex: true,

		logo: async (page: Page) => {
			return (
				(await page
					.locator('h1 img')
					.first()
					.getAttribute('src', {
						timeout: 100
					})
					.catch(() => null)) || ''
			)
		},

		name: async (page: Page) => {
			const txt =
				(await page
					.locator('h1')
					.first()
					.textContent({
						timeout: 100
					})
					.catch(() => null)) || ''

			return txt.replace(/like \d+/, '').trim()
		},

		xpathOrSelector: () => {
			return 'main section:nth-child(2) a[href*="discussions/"]'
		}
	},

	'^/[a-z0-9-_]+/[a-z0-9-_]+/commits': {
		regex: true,

		logo: async (page: Page) => {
			return (
				(await page
					.locator('h1 img')
					.first()
					.getAttribute('src', {
						timeout: 100
					})
					.catch(() => null)) || ''
			)
		},

		name: async (page: Page) => {
			const txt =
				(await page
					.locator('h1')
					.first()
					.textContent({
						timeout: 100
					})
					.catch(() => null)) || ''

			return txt.replace(/like \d+/, '').trim()
		},

		xpathOrSelector: () => {
			return 'article h3 div a:nth-child(1)'
		}
	},

	'^/[a-z0-9-_]+/[a-z0-9-_]+/commit/': {
		regex: true,

		description: () => null
	}
}
