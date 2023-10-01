import { writable, type Writable } from 'svelte/store'
import type { FeedDataWithId, SourceDataWithId, UserData } from './db'

export const user: Writable<UserData | null> = writable(null)

export const sources: Writable<SourceDataWithId[]> = writable([])

export const feed: Writable<Record<string, FeedDataWithId[]>> = writable({
	'0': []
})

export const feedState: Writable<
	Record<
		string,
		{
			initialised: boolean
			pushed: boolean
			end: boolean
			new: boolean
			scroll: number
			filter: string
		}
	>
> = writable({
	'0': {
		initialised: false,
		pushed: false,
		end: false,
		new: false,
		scroll: 0,
		filter: 'All'
	}
})

export const feedVisibility: Writable<
	Record<
		string,
		Record<
			string,
			{
				height: number
				show: boolean
			}
		>
	>
> = writable({
	'0': {}
})

export function removeFromFeed(id: number | undefined) {
	if (!id) return

	fetch(`/api/feed/?id=${id}`, {
		method: 'DELETE'
	})

	feed.update((f) => {
		Object.keys(f).forEach((sourceId) => {
			f[sourceId] = f[sourceId].filter((e) => e.id !== id)
		})
		return f
	})
}

export const intro: Writable<{
	current: string
	keyword: string
}> = writable({
	current: 'github',
	keyword: ''
})
