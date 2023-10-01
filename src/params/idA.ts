// The animation/swipe system only works between two different pages,
// when navigating between two sources, technically the same page is used for rendering.
// This system allows forcing the page change by taking advantage of the route matching mechanism.

let currentIdA = true

export function isCurrentIdA() {
	return currentIdA
}

export function setCurrentIdA(value: boolean) {
	currentIdA = value
}

export function match(_value: string) {
	if (isCurrentIdA()) {
		setCurrentIdA(false)
		return true
	}

	return false
}
