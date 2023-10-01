import type { Page } from 'playwright'

import youtube from './www.youtube.com'
import reddit from './www.reddit.com'
import devhunt from './devhunt.org'
import hackernoon from './hackernoon.com'
import github from './github.com'
import devto from './dev.to'
import consentYahoo from './consent.yahoo.com'
import medium from './.medium.com'
import hackerNews from './news.ycombinator.com'
import huggingface from './huggingface.co'

export interface Recipe {
	description?: (page: Page) => Promise<string> | string | null
	image?: (page: Page) => Promise<string> | null
	logo?: (page: Page) => Promise<string> | string
	name?: (page: Page) => Promise<string> | string
	regex?: boolean
	rss?: (url: string) => string
	run?: (page: Page) => Promise<void> | void
	title?: (page: Page) => Promise<string>
	xpathOrSelector?: (page: Page) => Promise<string> | string
}

export interface Recipes {
	[key: string]: {
		[key: string]: Recipe
	}
}

const recipes: Recipes = {
	'www.youtube.com': youtube,
	'www.reddit.com': reddit,
	'devhunt.org': devhunt,
	'hackernoon.com': hackernoon,
	'github.com': github,
	'dev.to': devto,
	'consent.yahoo.com': consentYahoo,
	'.medium.com': medium,
	'news.ycombinator.com': hackerNews,
	'huggingface.co': huggingface
}

export default recipes
