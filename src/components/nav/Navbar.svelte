<script context="module" lang="ts">
	let overlayScrollbar: OverlayScrollbarsComponent
	let lastSourceId: string = ''

	export function scrollTo(sourceId: string) {
		if (overlayScrollbar) {
			const element = document.querySelector('.source-' + sourceId)
			if (element) {
				const rect = element.getBoundingClientRect()
				const viewportHeight = window.innerHeight || document.documentElement.clientHeight
				const elementHeight = rect.bottom - rect.top
				const scrollPosition = rect.top - (viewportHeight - elementHeight) / 2
				const instance = overlayScrollbar.osInstance()
				const hasScroll = instance?.state().overflowAmount.y
				instance?.elements().viewport.scrollTo({
					top: hasScroll
						? scrollPosition + instance?.elements().viewport.scrollTop
						: scrollPosition,
					behavior: 'smooth'
				})
			}
		}
	}

	export function scrollToMobile(sourceId: string) {
		if (overlayScrollbar) {
			const element = document.querySelector('.source-' + sourceId)
			if (element) {
				lastSourceId = sourceId
				const rect = element.getBoundingClientRect()
				const viewportWidth = window.innerWidth || document.documentElement.clientWidth
				const elementWidth = rect.right - rect.left
				const scrollPosition = rect.left - (viewportWidth - elementWidth) / 2
				const instance = overlayScrollbar.osInstance()
				const hasScroll = instance?.state().overflowAmount.x
				instance?.elements().viewport.scrollTo({
					left: hasScroll
						? scrollPosition + instance?.elements().viewport.scrollLeft
						: scrollPosition,
					behavior: 'smooth'
				})
			}
		}
	}

	export interface PreventElement {
		left: number
		top: number
		id: number
	}
</script>

<script lang="ts">
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { sources, user } from '$lib/store'
	import { touchStart, touchEnd, touchMove, innerWidth, innerHeight } from '$lib/window'
	import type { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte'
	import type { SourceDataWithId } from '$lib/db'
	import { routes } from '$routes/+layout.svelte'
	import { tick } from 'svelte'
	import NavbarDesktop from '$components/nav/Navbar.desktop.svelte'
	import NavbarMobile from '$components/nav/Navbar.mobile.svelte'

	let items: SourceDataWithId[] = []
	let prevent: PreventElement[] = []
	const flipDurationMs = 300
	let navbar: HTMLDivElement
	// desk
	let dragging = false
	let hover: number | null = null
	// mob
	let dragDistance: number | null = null
	let open: boolean = false
	let dragDisabled = false
	let hasScrollbar = false

	function handleSort(e: any) {
		if (e.detail.info.trigger === 'dragStarted') {
			if ($innerWidth > 768) dragging = true
			else {
				const instance = overlayScrollbar.osInstance()
				const viewport = instance?.elements().viewport
				if (viewport) {
					viewport.style.overflowY = 'hidden'
				}
			}
		} else if (e.detail.info.trigger.match('drop|dragCanceled')) {
			if ($innerWidth > 768) dragging = false
			else {
				const instance = overlayScrollbar.osInstance()
				const viewport = instance?.elements().viewport
				if (viewport) {
					viewport.style.overflowY = 'auto'
				}
			}
		}

		items = e.detail.items

		if (e.detail.info.trigger === 'droppedIntoZone') {
			$routes = ['/settings', '/', ...items.map((s) => `/feed/${s.id}`), '/add/feed']

			const navOrder = items.map((s) => s.id).join(',')

			fetch('/api/user/me', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					userData: {
						...$user,
						navOrder
					}
				})
			})

			if ($user)
				user.set({
					...$user,
					navOrder
				})

			setTimeout(() => {
				preventing()
			}, 300)
		}
	}

	async function close(noPreventing?: boolean) {
		open = false

		await tick()
		dragDisabled = $innerWidth < navbar.clientWidth
		if (!noPreventing) preventing()
	}

	// TODO: Improve with IntersectionObserver
	async function preventing() {
		await tick()

		const tempPrevent: { left: number; top: number; id: number }[] = []

		document.querySelectorAll('.navbar span.disabled').forEach((el) => {
			// get el position inside .navbar
			const rect = el.getBoundingClientRect()
			const navbarRect = navbar.getBoundingClientRect()
			const left = rect.left - navbarRect.left
			const top = rect.top - navbarRect.top
			// retrieve the source id from class source-x
			const id = parseInt(
				(el.className.match(/source-\d+/)?.[0] ?? 'source-0').replace('source-', '')
			)
			tempPrevent.push({ left, top, id })
		})

		prevent = tempPrevent
	}

	async function handleSourceClick(id: number) {
		if (id && activeRoute !== `/feed/${id}`) {
			hover = null
			await goto(`/feed/${id}`)
		}
	}

	async function handleNavigation() {
		await tick()
		dragDisabled = $innerWidth < navbar.clientWidth
		preventing()
	}

	async function setItems() {
		const sourceIds = $user?.navOrder?.split(',')
		if (sourceIds?.length) {
			items = $sources
				.map((source) => source)
				.sort((a, b) => {
					const indexA = sourceIds.indexOf(`${a.id}`)
					const indexB = sourceIds.indexOf(`${b.id}`)
					return indexA - indexB
				})
		}

		if ($innerWidth > 768) preventing()
		else {
			await tick()
			close()
		}
	}

	function handleTouch(event: TouchEvent) {
		const touch = event.touches[0]
		const y = touch.clientY
		if (dragDistance !== null) {
			if (dragDistance - y > 100) {
				const instance = overlayScrollbar.osInstance()
				if (instance?.state().overflowAmount.x) {
					open = true
					preventing()
				}
			}
		} else {
			dragDistance = y
		}
	}

	function handleTouchEnd() {
		dragDistance = null
	}

	async function scrollToMobileOpen() {
		if (overlayScrollbar) {
			const element = document.querySelector('.source-' + lastSourceId)
			if (element) {
				const navbarTop = document.querySelector('.navbar')?.getBoundingClientRect().top ?? 0
				const rect = element.getBoundingClientRect()
				const instance = overlayScrollbar.osInstance()
				const viewportHeight = instance?.elements().viewport.clientHeight || 0
				const elementHeight = rect.bottom - rect.top
				const scrollPosition = rect.top - navbarTop - (viewportHeight - elementHeight) / 2
				const hasScroll = instance?.state().overflowAmount.y
				instance?.elements().viewport.scrollTo({
					top: hasScroll
						? scrollPosition + instance?.elements().viewport.scrollTop
						: scrollPosition,
					behavior: 'smooth'
				})
			}
		}
	}

	async function checkScrollbar() {
		await tick()
		hasScrollbar = $innerHeight - 52 < navbar.scrollHeight
	}

	// mutual
	$: activeRoute = $page.url.pathname
	$: if (!items.length && $sources.length) setItems()
	$: if ($page) handleNavigation()
	// mobile only
	$: if ($touchStart && ($touchStart.target as HTMLElement)?.closest('.navbar'))
		handleTouch($touchStart)
	$: if (dragDistance !== null && $touchMove && !open) handleTouch($touchMove)
	$: if ($touchEnd) handleTouchEnd()
	$: if (!open && lastSourceId) setTimeout(() => scrollToMobile(lastSourceId), 100)
	$: if (open && lastSourceId) setTimeout(() => checkScrollbar(), 100)
</script>

{#if $innerWidth > 768}
	<NavbarDesktop
		bind:overlayScrollbar
		bind:navbar
		{flipDurationMs}
		{activeRoute}
		{prevent}
		{items}
		{hover}
		{dragging}
		{handleSourceClick}
		{handleSort}
	/>
{:else}
	<NavbarMobile
		bind:overlayScrollbar
		bind:navbar
		{flipDurationMs}
		{activeRoute}
		{prevent}
		{items}
		{open}
		{hasScrollbar}
		{dragDisabled}
		{scrollToMobileOpen}
		{handleSourceClick}
		{handleSort}
		{close}
	/>
{/if}
