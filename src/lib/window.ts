import { readable, type Readable } from 'svelte/store'

export const innerWidth = readable(window.innerWidth, function start(set) {
	const handleResize = () => {
		set(window.innerWidth)
	}

	window.addEventListener('resize', handleResize)

	return function stop() {
		window.removeEventListener('resize', handleResize)
	}
})

export const innerHeight = readable(window.innerHeight, function start(set) {
	const handleResize = () => {
		set(window.innerHeight)
	}

	window.addEventListener('resize', handleResize)

	return function stop() {
		window.removeEventListener('resize', handleResize)
	}
})

type KeyEvent = KeyboardEvent | null

export const keydown: Readable<KeyEvent> = readable(
	null,
	function start(set: (value: KeyEvent) => void) {
		const handleKeydown = (event: KeyboardEvent) => {
			set(event)
			setTimeout(() => set(null), 100)
		}

		window.addEventListener('keydown', handleKeydown)

		return function stop() {
			window.removeEventListener('keydown', handleKeydown)
		}
	}
)

export const keyup: Readable<KeyEvent> = readable(
	null,
	function start(set: (value: KeyEvent) => void) {
		const handleKeyup = (event: KeyboardEvent) => {
			set(event)
			setTimeout(() => set(null), 100)
		}

		window.addEventListener('keyup', handleKeyup)

		return function stop() {
			window.removeEventListener('keyup', handleKeyup)
		}
	}
)

type ClickEvent = MouseEvent | null

export const click: Readable<ClickEvent> = readable(
	null,
	function start(set: (value: ClickEvent) => void) {
		const handleClick = (event: MouseEvent) => {
			set(event)
			setTimeout(() => set(null), 100)
		}

		window.addEventListener('click', handleClick)

		return function stop() {
			window.removeEventListener('click', handleClick)
		}
	}
)

type TouchStartEvent = TouchEvent | null

export const touchStart: Readable<TouchStartEvent> = readable(
	null,
	function start(set: (value: TouchStartEvent) => void) {
		const handleTouchStart = (event: TouchEvent) => {
			set(event)
			setTimeout(() => set(null), 100)
		}

		window.addEventListener('touchstart', handleTouchStart)

		return function stop() {
			window.removeEventListener('touchstart', handleTouchStart)
		}
	}
)

type TouchEndEvent = TouchEvent | null

export const touchEnd: Readable<TouchEndEvent> = readable(
	null,
	function start(set: (value: TouchEndEvent) => void) {
		const handleTouchEnd = (event: TouchEvent) => {
			set(event)
			setTimeout(() => set(null), 100)
		}

		window.addEventListener('touchend', handleTouchEnd)

		return function stop() {
			window.removeEventListener('touchend', handleTouchEnd)
		}
	}
)

type TouchMoveEvent = TouchEvent | null

export const touchMove: Readable<TouchMoveEvent> = readable(
	null,
	function start(set: (value: TouchMoveEvent) => void) {
		const handleTouchMove = (event: TouchEvent) => {
			set(event)
			setTimeout(() => set(null), 10)
		}

		window.addEventListener('touchmove', handleTouchMove)

		return function stop() {
			window.removeEventListener('touchmove', handleTouchMove)
		}
	}
)

type VisibilityChangeEvent = DocumentVisibilityState | null

export const visibility: Readable<VisibilityChangeEvent> = readable(
	null,
	function start(set: (value: VisibilityChangeEvent) => void) {
		const handleVisibilityChange = () => {
			set(document.visibilityState)
			setTimeout(() => set(null), 100)
		}

		document.addEventListener('visibilitychange', handleVisibilityChange)

		return function stop() {
			document.removeEventListener('visibilitychange', handleVisibilityChange)
		}
	}
)
