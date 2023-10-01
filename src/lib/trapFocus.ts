import * as focusTrap from 'focus-trap'

export default function (element: HTMLElement, prevent?: boolean) {
	if (prevent) return

	const trap = focusTrap.createFocusTrap(element, {
		clickOutsideDeactivates: false,
		escapeDeactivates: false,
		returnFocusOnDeactivate: false,
		allowOutsideClick: true
	})

	setTimeout(() => {
		try {
			if (element) trap.activate()
		} catch (e) {
			//
		}
	}, 1)

	return {
		destroy() {
			trap.deactivate()
		}
	}
}
