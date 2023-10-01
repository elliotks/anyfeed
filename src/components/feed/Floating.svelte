<script lang="ts">
	import { fade, fly } from 'svelte/transition'
	import FloatingButton from '$components/common/FloatingButton.svelte'
	import { touchStart, touchEnd, touchMove, innerWidth } from '$lib/window'
	import type { FeedDataWithId, SourceDataWithId } from '$lib/db'
	import { startLoad, stopLoad } from '$components/feed/LoadBar.svelte'
	import { send } from '$components/common/Alert.svelte'
	import { feed } from '$lib/store'
	import { overlayScrollbar } from '$routes/+layout.svelte'
	import { page } from '$app/stores'

	export let childPage: string = ''
	export let open: () => void = () => {}
	export let close: () => void = () => {}
	export let source: SourceDataWithId | null = null

	let reload = false
	let initialTouch = 0
	let dragDistance = 0
	let loading = false

	async function sync() {
		if (loading || reload) return

		loading = true
		reload = true
		setTimeout(() => (reload = false), 1000)

		startLoad()

		const res = await fetch('/api/source/sync', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				sourceId: source?.id
			})
		}).catch(() => {
			//
		})

		stopLoad()
		loading = false

		if (!res || res.ok === false) {
			send('Error syncing source')
			return
		}

		const data = await res.json()

		if (data && !data.length) {
			send('No new content', 'text-center')
			return
		}

		if (data) {
			$feed[data[0].sourceId] = [...data, ...$feed[data[0].sourceId]]
			const dataNotAlreadyInFeed0 = data.filter(
				(d: FeedDataWithId) => !$feed['0'].find((f) => f.id === d.id)
			)
			$feed['0'] = [...dataNotAlreadyInFeed0, ...$feed['0']].map((e) => {
				e.hide = 0
				return e
			})
			$feed['0'] = $feed['0'].sort(
				(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			)
		}
	}

	function handleTouch(event: TouchEvent) {
		if ($innerWidth > 768) return
		if (!$page.url.pathname.match(/^\/feed\/\d+$/)) return

		const touch = event.touches[0]
		const y = touch.clientY

		if (initialTouch === 0) {
			const instance = overlayScrollbar.osInstance()
			const scrollTop = instance?.elements().viewport.scrollTop
			if (scrollTop !== 0) return
			if ((event.target as HTMLElement)?.closest('.mask')) return

			initialTouch = y
			dragDistance = 0
		} else {
			dragDistance = y - initialTouch
		}
	}

	function handleTouchEnd() {
		if ($innerWidth > 768) return
		if (dragDistance >= 280) sync()

		dragDistance = 0
		initialTouch = 0
	}

	$: if ($touchStart) handleTouch($touchStart)
	$: if (dragDistance !== null && $touchMove) handleTouch($touchMove)
	$: if ($touchEnd) handleTouchEnd()
</script>

{#if $innerWidth > 768}
	<div fixed top-6 right-6 transition:fade>
		{#if childPage === 'edit'}
			<span on:click={close} cursor-pointer>
				<FloatingButton>
					<i i={'tabler-arrow-back'} />
				</FloatingButton>
			</span>
		{:else}
			<span on:click={open} block cursor-pointer>
				<FloatingButton>
					<i i={'fluent-edit-16-filled'} />
				</FloatingButton>
			</span>
			<span on:click={sync} block mt-5 cursor-pointer>
				<FloatingButton>
					<i i={'ooui-reload'} class:reload />
				</FloatingButton>
			</span>
		{/if}
	</div>
{/if}

{#if dragDistance > 150}
	<span
		transition:fly={{ y: -100 }}
		on:click={sync}
		block
		fixed
		style="top: {20 + dragDistance - 150 < 150
			? 20 + dragDistance - 150
			: 150}px; left: calc(50% - 24px);"
	>
		<FloatingButton>
			<i
				i={'ooui-reload'}
				class:color-teal-500={20 + dragDistance - 150 >= 150}
				style="transform: rotate({90 + dragDistance - 150}deg); transform-origin: center;"
			/>
		</FloatingButton>
	</span>
{/if}

<style lang="scss">
	:global(.reload) {
		animation: spin 1s linear infinite;
		transform-origin: center;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
