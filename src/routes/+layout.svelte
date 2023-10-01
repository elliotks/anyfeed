<script context="module" lang="ts">
	export const routes: Writable<string[]> = writable(['/settings', '/', '/add/feed'])
	export const canInfiniteLoad: Writable<boolean> = writable(false)
	export const showScrollToTop: Writable<boolean> = writable(false)

	export let overlayScrollbar: OverlayScrollbarsComponent

	export function scrollTop(smooth: boolean = false, id?: number) {
		if (smooth === false && id) {
			document.querySelector(`[data-id="${id}"]`)?.scrollIntoView()
		} else if (overlayScrollbar) {
			const instance = overlayScrollbar.osInstance()

			instance?.elements().viewport.scrollTo({
				top: 0,
				behavior: smooth ? 'smooth' : 'instant'
			})
		}
	}
</script>

<script lang="ts">
	import 'uno.css'
	import '@unocss/reset/tailwind.css'
	import 'overlayscrollbars/overlayscrollbars.css'
	import './global.css'

	import { onMount } from 'svelte'
	import { writable, type Writable } from 'svelte/store'
	import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte'
	import type { EventListenerArgs } from 'overlayscrollbars'
	import Navbar from '$components/nav/Navbar.svelte'
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { innerWidth, keydown, keyup } from '$lib/window'
	import { feed, feedState, feedVisibility, sources, user } from '$lib/store'
	import LoadBar from '$components/feed/LoadBar.svelte'
	import Alert from '$components/common/Alert.svelte'

	export let data

	let scrollContainer: HTMLDivElement
	let canSwipe = true
	let scrollLeft = 0
	let scrollWidth = 0
	let clientWidth = 0
	let previousScrollLeft = 0
	let previousDirection: string | null = null
	let activeScrollSpace: boolean = true
	let prevScrollPos = 0
	let prevWidth = 0
	let scrollTimeout: ReturnType<typeof setTimeout>
	let remainingHeight: number | null = null
	let lastKeydown: number = 0

	$: tolerance = $innerWidth > 768 ? 3 : 1
	$: showScroll =
		(!$user?.swipeUI && $innerWidth > 768) ||
		(scrollLeft > (scrollWidth - clientWidth) / 2 - tolerance &&
			scrollLeft < (scrollWidth - clientWidth) / 2 + tolerance)
	$: if ($user && !$user.swipeUI && $innerWidth > 768) activeScrollSpace = false
	$: if ($innerWidth) resetFeedVisibility()
	$: if ($keydown) handleKeydown($keydown)
	$: if ($keyup) handleKeyup($keyup)

	function init() {
		if (data.user) $user = data.user
		if (data.sources) $sources = data.sources

		const sourceIds = $user?.navOrder?.split(',')
		$routes = [
			'/settings',
			'/',
			...(sourceIds ? sourceIds.map((id) => `/feed/${id}`) : []),
			'/add/feed'
		]

		$sources.forEach((source) => {
			$feed[`${source.id}`] = []
			$feedState[`${source.id}`] = {
				initialised: false,
				end: false,
				pushed: false,
				new: false,
				scroll: 0,
				filter: 'All'
			}
			$feedVisibility[`${source.id}`] = {}
		})
	}

	init()

	function resetFeedVisibility() {
		if (prevWidth && prevWidth !== $innerWidth) {
			Object.keys($feedVisibility).forEach((key) => {
				$feedVisibility[key] = {}
			})
		}
		prevWidth = $innerWidth
	}

	function getFirstVisibleArticle() {
		const articles = document.querySelectorAll('[data-id]')

		for (let i = 0; i < articles.length; i++) {
			const article = articles[i]

			const rect = article.getBoundingClientRect()
			const isVisible = rect.bottom >= 100 && rect.top <= window.innerHeight

			if (isVisible) {
				return parseInt(article.getAttribute('data-id') || '0')
			}

			if (i === articles.length - 1) {
				return parseInt(article.getAttribute('data-id') || '0')
			}
		}

		return 0
	}

	function getRemainingHeight() {
		// calc remaining space between last article and the end of [data-overlayscrollbars-viewport] element
		const allArticles = document.querySelectorAll('[data-id]')
		if (allArticles.length) {
			const lastArticle = allArticles[allArticles.length - 1]
			const lastArticleBottom = lastArticle.getBoundingClientRect().bottom
			const end = document.querySelector('.end')
			const endTop = end?.getBoundingClientRect().top || 0
			return endTop - lastArticleBottom
		}

		return 0
	}

	function onScroll(e: { detail: EventListenerArgs['scroll'] }) {
		const [instance] = e.detail

		if (remainingHeight === null) remainingHeight = getRemainingHeight()

		if (
			instance.elements().content.scrollTop >
			instance.state().overflowAmount.y - (remainingHeight + 700)
		) {
			$canInfiniteLoad = true
			setTimeout(() => ($canInfiniteLoad = false), 1)
		}

		// show scroll to top

		let currentScrollPos = instance.elements().content.scrollTop

		if (currentScrollPos < prevScrollPos && instance.elements().content.scrollTop > 500) {
			$showScrollToTop = true
		} else if (
			instance.elements().content.scrollTop <= 1 ||
			currentScrollPos - prevScrollPos > 20
		) {
			$showScrollToTop = false
		}

		if (Math.abs(currentScrollPos - prevScrollPos) > 20) prevScrollPos = currentScrollPos

		// store current visible article

		clearTimeout(scrollTimeout)

		scrollTimeout = setTimeout(function () {
			if ($page.url.pathname !== '/' && !$page.url.pathname.match(/^\/feed\/\d+$/)) return
			const visibleArticleId = currentScrollPos < 300 ? 0 : getFirstVisibleArticle()

			if ($page.url.pathname === '/') $feedState['0'].scroll = visibleArticleId
			else $feedState[$page.params.sourceId].scroll = visibleArticleId

			remainingHeight = getRemainingHeight()
		}, 200)
	}

	function onUpdated(e: { detail: EventListenerArgs['updated'] }) {
		const [instance] = e.detail

		if (instance.elements().content.scrollTop > instance.state().overflowAmount.y - 700) {
			$canInfiniteLoad = true
			setTimeout(() => ($canInfiniteLoad = false), 1)
		}
	}

	function getRouteIndex() {
		return $routes.indexOf($page.url.pathname.replace(/\/edit$/, '').replace(/\/sync$/, ''))
	}

	function handleKeyup(e: KeyboardEvent) {
		if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return
		if (lastKeydown === 0 || lastKeydown === -1) {
			lastKeydown = 0
			return
		}
		lastKeydown = 0
		if (!e.shiftKey) return

		if (e.key === 'ArrowLeft') {
			const index = getRouteIndex()
			if (index > 0) goto($routes[index - 1])
		} else if (e.key === 'ArrowRight') {
			const index = getRouteIndex()
			if (index < $routes.length - 1) goto($routes[index + 1])
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return
		if (lastKeydown === -1) return
		if (lastKeydown === 0) lastKeydown = Date.now()
		// longpress
		else if (Date.now() - lastKeydown > 700) {
			lastKeydown = -1
			if (e.key === 'ArrowLeft') {
				goto('/')
			} else if (e.key === 'ArrowRight') {
				goto('/add/feed')
			}
		}
	}

	onMount(() => {
		if (!$user?.swipeUI && $innerWidth > 768) return

		scrollContainer.addEventListener('scroll', async () => {
			if (!activeScrollSpace) return

			scrollLeft = scrollContainer.scrollLeft
			scrollWidth = scrollContainer.scrollWidth
			clientWidth = scrollContainer.clientWidth

			const middle = (scrollWidth - clientWidth) / 2

			// we detect direction and if it changes, we can swipe again
			if (Math.abs(previousScrollLeft - scrollLeft) > 10) {
				let direction

				if (scrollLeft < previousScrollLeft) direction = 'left'
				else direction = 'right'

				previousScrollLeft = scrollLeft

				if (previousDirection && previousDirection !== direction) canSwipe = true
				previousDirection = direction
			}

			// routing triggers
			if (scrollLeft < tolerance) {
				if (canSwipe) {
					const index = getRouteIndex()
					if (index > 0) {
						await goto($routes[index - 1])

						activeScrollSpace = false
						setTimeout(() => {
							activeScrollSpace = true
						}, 50)
					}
					canSwipe = false
				}
			} else if (scrollLeft > scrollWidth - clientWidth - tolerance) {
				if (canSwipe) {
					const index = getRouteIndex()
					if (index < $routes.length - 1) {
						await goto($routes[index + 1])

						activeScrollSpace = false
						setTimeout(() => {
							activeScrollSpace = true
						}, 50)
					}
					canSwipe = false
				}
			}
		})
	})
</script>

<div flex="~ col-reverse md:row" w-screen h="100dvh" overflow-hidden>
	{#key $innerWidth}
		<Navbar />
	{/key}
	<div
		class="scroll-container relative"
		w="screen md:[calc(100dvw-52px)]"
		h="[calc(100dvh-52px)] md:100dvh"
		overflow={$user?.swipeUI || $innerWidth <= 768 ? 'x-scroll' : 'hidden'}
		bind:this={scrollContainer}
	>
		<LoadBar />
		<Alert />
		<div class:activeScrollSpace class="scroll" flex>
			{#if activeScrollSpace}<div class="scroll-space" />{/if}
			<div class="main relative" h="[calc(100dvh-52px)] md:100dvh">
				<OverlayScrollbarsComponent
					options={{
						scrollbars: {
							visibility: showScroll ? 'auto' : 'hidden',
							autoHide: $innerWidth > 768 ? 'move' : 'scroll',
							autoHideDelay: 400
						},
						overflow: {
							x: 'hidden'
						}
					}}
					h="[calc(100dvh-52px)] md:100dvh"
					bind:this={overlayScrollbar}
					on:osScroll={onScroll}
					on:osUpdated={onUpdated}
				>
					<slot />
					<div class="end" />
				</OverlayScrollbarsComponent>
			</div>
			{#if activeScrollSpace}<div class="scroll-space" />{/if}
		</div>
	</div>
</div>

<style lang="scss">
	:global(.xl-max-w) {
		@media (min-width: 1280px) {
			max-width: 1056px;
		}
	}

	.scroll-container {
		scroll-snap-type: x mandatory;
		scrollbar-width: none;
		-ms-overflow-style: none;
		&::-webkit-scrollbar {
			display: none;
		}
	}

	.scroll {
		width: calc(100dvw - 52px);

		@media screen and (max-width: 768px) {
			width: 100dvw;
		}

		&.activeScrollSpace {
			width: calc(120dvw - 52px);

			@media screen and (max-width: 768px) {
				width: 140dvw;
			}
		}
	}

	.scroll-space {
		width: calc(10dvw);
		scroll-snap-align: none;

		@media screen and (max-width: 768px) {
			width: 20dvw;
		}
	}

	.main {
		width: calc(100dvw - 52px);

		@media screen and (max-width: 768px) {
			width: 100dvw;
		}

		scroll-snap-align: center;

		overflow-y: hidden;
	}
</style>
