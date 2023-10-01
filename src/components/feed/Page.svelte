<script lang="ts">
	import { page } from '$app/stores'
	import { onMount } from 'svelte'
	import { fly, fade } from 'svelte/transition'
	import { navigating } from '$app/stores'
	import comesFrom from '$lib/comesFrom'
	import { scrollTop, canInfiniteLoad, overlayScrollbar } from '$routes/+layout.svelte'
	import { sources, feed, feedState, feedVisibility, user } from '$lib/store'
	import CardLoad from '$components/feed/Card.load.svelte'
	import Card from '$components/feed/Card.svelte'
	import Top from '$components/feed/Top.svelte'
	import Floating from '$components/feed/Floating.svelte'
	import { scrollTo, scrollToMobile } from '$components/nav/Navbar.svelte'
	import { routes } from '$routes/+layout.svelte'
	import { goto } from '$app/navigation'
	import Badge from '$components/common/Badge.svelte'
	import { innerWidth, visibility, keydown, keyup } from '$lib/window'
	import BackToTop from '$components/feed/BackToTop.svelte'
	import type { SourceDataWithId } from '$lib/db'
	import TabsNav from '$components/common/TabsNav.svelte'
	import NewContent from './NewContent.svelte'
	import Intro from '$components/starter/Intro.svelte'
	import Advices from '$components/starter/Advices.svelte'

	const pageId = $page.params.sourceId || '0'
	let observer: IntersectionObserver
	let visible = !$navigating?.to
	let isLoading = false
	let flyInOptions: { x?: number; y?: number; duration: number }
	let source: SourceDataWithId | null = null
	let showFloating = false
	let lastKeydown: number = 0

	function handleIntersect(entries: IntersectionObserverEntry[]) {
		if (!$feedVisibility[pageId]) return

		entries.forEach((entry) => {
			const id = entry.target.getAttribute('data-id')

			if (id) {
				if (!$feedVisibility[pageId][id] || !$feedVisibility[pageId][id].height) {
					const height = (entry.target as HTMLElement).offsetHeight
					$feedVisibility[pageId][id] = { height, show: false }
				}

				if (entry.isIntersecting) $feedVisibility[pageId][id].show = true
				else $feedVisibility[pageId][id].show = false
			}
		})
	}

	function createObserver() {
		observer = new IntersectionObserver(handleIntersect, {
			rootMargin: '0px',
			threshold: 0.01
		})
	}

	function observeElement(node: HTMLElement) {
		observer.observe(node)
	}

	function handleKeyup(e: KeyboardEvent) {
		if (!['ArrowUp', 'ArrowDown'].includes(e.key)) return
		if (lastKeydown === 0 || lastKeydown === -1) {
			lastKeydown = 0
			return
		}
		lastKeydown = 0
		if (!e.shiftKey) return

		const instance = overlayScrollbar.osInstance()

		if (e.key === 'ArrowUp') {
			instance?.elements().viewport.scrollTo({
				top: instance?.elements().viewport.scrollTop - 450,
				behavior: 'smooth'
			})
		} else if (e.key === 'ArrowDown') {
			instance?.elements().viewport.scrollTo({
				top: instance?.elements().viewport.scrollTop + 450,
				behavior: 'smooth'
			})
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!['ArrowUp', 'ArrowDown'].includes(e.key)) return
		if (lastKeydown === -1) return
		if (lastKeydown === 0) lastKeydown = Date.now()
		// longpress
		else if (Date.now() - lastKeydown > 700) {
			lastKeydown = -1
			if (e.key === 'ArrowUp') {
				scrollTop(true)
			}
		}
	}

	async function loadFeed() {
		if (!$feedState[pageId].initialised) await new Promise((r) => setTimeout(r, 500))

		if (!$canInfiniteLoad && $feedState[pageId].initialised) return

		let urlPart = ''

		if ($page.params.sourceId) {
			if (isLoading || $feedState[pageId].end) return
			urlPart = pageId
		} else {
			if (!$sources.length || isLoading || $feedState[pageId].end) {
				if (!$sources.length) {
					$feedState[pageId].initialised = true
					$feedState[pageId].end = true
				}
				return
			}

			const sourceIds = $sources.filter((source) => source.displayOnHome).map((source) => source.id)

			if (!sourceIds.length) return

			urlPart = sourceIds.join(',')
		}

		isLoading = true

		fetch(
			`/api/feed?sourceIds=${urlPart}&last=${
				$feed[pageId].length ? $feed[pageId][$feed[pageId].length - 1].id : ''
			}&filter=${$feedState[pageId].filter}`
		)
			.then((res) => res.json())
			.then((res) => {
				if (res.length) {
					setTimeout(() => {
						$feed[pageId] = [...$feed[pageId], ...res]
						$feedState[pageId].pushed = true
						if (res.length < 10) {
							$feedState[pageId].end = true
						}
						setTimeout(() => {
							isLoading = false
						}, 500)
					}, 500)
				} else {
					$feedState[pageId].pushed = true
					$feedState[pageId].end = true
					isLoading = false
				}
				$feedState[pageId].initialised = true
			})
	}

	function getSource(id: number) {
		return $sources.find((source) => source.id === id)
	}

	function resetFeed() {
		$feed[pageId] = []
		$feedState[pageId].initialised = false
		$feedState[pageId].end = false
		$feedState[pageId].pushed = false
		$feedState[pageId].new = false
		$feedState[pageId].scroll = 0
		$feedVisibility[pageId] = {}
	}

	function changeFilter() {
		resetFeed()

		setTimeout(() => {
			loadFeed()
		}, 50)
	}

	function openEdit() {
		visible = false

		setTimeout(() => {
			goto(`/feed/${pageId}/edit`)
		}, 200)
	}

	function checkNewContent(sources: SourceDataWithId[] | false, reload?: boolean) {
		if (((sources && sources.length) || !sources) && $feedState[pageId].filter === 'All') {
			const urlPart = sources
				? sources
						.filter((source) => source.displayOnHome)
						.map((source) => source.id)
						.join(',')
				: pageId

			fetch(`/api/feed?sourceIds=${urlPart}&limit=1`)
				.then((res) => res.json())
				.then((res) => {
					if (!$feed[pageId] || (res.length && res[0].id !== $feed[pageId]?.[0]?.id)) {
						if (!reload) $feedState[pageId].new = true
						else document.location.reload()

						Object.keys($feedVisibility).forEach((key) => {
							$feedVisibility[key] = {}
						})
					}
				})
		}
	}

	onMount(() => {
		if ($feedState[pageId].filter !== 'All') {
			$feedState[pageId].filter = 'All'
			resetFeed()
		}

		setTimeout(() => {
			if ($innerWidth > 768) scrollTo($page.params.sourceId || 'home')
			else scrollToMobile($page.params.sourceId || 'home')

			scrollTop(false, $feedState[pageId].scroll)
		}, 1)

		if ($navigating?.from?.url.pathname === `/feed/${pageId}/edit`) {
			flyInOptions = { y: -100, duration: 200 }
		} else {
			const x = !$navigating?.from ? 0 : comesFrom($routes, $navigating) === 'right' ? -2000 : 2000
			flyInOptions = { x, duration: 300 }
		}
		visible = true

		if ($page.params.sourceId) {
			source = $sources.find((source) => source.id === +pageId) || null
		}

		if ($feedState[pageId].initialised) checkNewContent(!$page.params.sourceId ? $sources : false)

		loadFeed()

		createObserver()

		setTimeout(() => {
			showFloating = true
		}, 250)

		return () => {
			observer.disconnect()
		}
	})

	$: if (
		$canInfiniteLoad &&
		$feedState[pageId] &&
		$feedState[pageId].initialised &&
		!$feedState[pageId].end
	)
		loadFeed()
	$: if ($visibility === 'visible') checkNewContent(!$page.params.sourceId ? $sources : false, true)
	$: if ($keydown) handleKeydown($keydown)
	$: if ($keyup) handleKeyup($keyup)
</script>

{#if visible && (!$page.params.sourceId || ($page.params.sourceId && source))}
	{#if showFloating && $page.params.sourceId}
		<div transition:fade>
			<Floating open={openEdit} {source} />
		</div>
	{/if}
	<div class="fly" in:fly={flyInOptions} out:fly={{ y: -100, duration: 200 }} text-center>
		{#if $page.params.sourceId}
			<Top open={openEdit} {source} class="xl-max-w" />
		{/if}
		<div text-center mx-auto max-w-lg px-4 pb-4 class="xl-max-w">
			{#if $sources.length}
				<div mt-4>
					<TabsNav
						links={[
							{
								name: 'All'
							},
							{
								name: 'Starred'
							}
						]}
						bind:current={$feedState[pageId].filter}
						navigate={changeFilter}
					/>
				</div>
			{/if}

			{#if $feedState[pageId].new}
				<NewContent />
			{/if}

			{#each $feed[pageId] as feedData}
				<div
					mt="4 md:8"
					mx-auto
					text-left
					class:mb-12={feedData.image && $innerWidth >= 1280}
					data-id={feedData.id}
					use:observeElement
				>
					{#if !$feedVisibility[pageId][feedData.id] || $feedVisibility[pageId][feedData.id].show}
						<Card
							data={{
								...feedData,
								name: getSource(feedData.sourceId)?.name || '',
								sourceUrl: getSource(feedData.sourceId)?.url || '',
								avatar: getSource(feedData.sourceId)?.avatar,
								background: getSource(feedData.sourceId)?.avatar?.background
							}}
							expandable={true}
						/>
					{:else}
						<div
							class="placeholder"
							style="height: {$feedVisibility[pageId][feedData.id]
								? $feedVisibility[pageId][feedData.id].height
								: 418}px"
						/>
					{/if}
				</div>
			{/each}

			{#if $sources.length && !$feedState[pageId].initialised}
				<div transition:fade>
					<div mt="4 md:8" mx-auto text-left>
						<CardLoad expandable={true} noAvatar={!!$page.params.sourceId} />
					</div>
					<div mt="4 md:8" mx-auto text-left>
						<CardLoad expandable={true} noAvatar={!!$page.params.sourceId} />
					</div>
				</div>
			{/if}

			{#if $feed[pageId].length && !$feedState[pageId].end}
				<div transition:fade my-8 mx-auto text-slate-400 class:mb-11={$user?.showSourcesStarter}>
					<Badge close={false} loading={true} />
				</div>
			{:else if $feed[pageId].length && $feedState[pageId].end}
				<div
					transition:fade
					my-8
					mx-auto
					text-slate-400w
					class:mb-11={!$page.params.sourceId && $user?.showSourcesStarter}
				>
					<Badge close={false}>You reached the end of your feeds</Badge>
				</div>
			{:else if ($page.params.sourceId || !$user?.showSourcesStarter) && !$feed[pageId].length && $feedState[pageId].end}
				<!-- <div transition:fade mt="4 md:8" mx-auto text-slate-400>
					{#if $page.params.sourceId}
						You can manually update your feed to see<br />if any new content has been published
					{:else}
						It looks rather empty here.
						<br /><a href="/add/feed" underline underline-dashed> Why don't you add some feeds? </a>
					{/if}
				</div> -->
			{/if}

			{#if !$page.params.sourceId && (!$sources.length || $feedState[pageId].initialised) && $user?.showSourcesStarter}
				<div mt-4 mx-auto text-left transition:fade={{ delay: !$sources.length ? 0 : 500 }}>
					<Intro />
				</div>
			{/if}
			{#if $page.params.sourceId}
				<div mt-4 mx-auto text-left transition:fade={{ delay: !$sources.length ? 0 : 500 }}>
					<Advices />
				</div>
			{/if}
		</div>
	</div>

	<BackToTop />
{/if}
