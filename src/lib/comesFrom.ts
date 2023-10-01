import type { Navigation } from '@sveltejs/kit'

export default function (routes: string[], navigating: Navigation | null) {
	if (!navigating?.to) return false

	const fromIndex = routes.indexOf(
		navigating.from?.url.pathname.replace(/\/edit$/, '').replace(/\/sync$/, '') ?? ''
	)
	const toIndex = routes.indexOf(
		navigating.to.url.pathname.replace(/\/edit$/, '').replace(/\/sync$/, '') ?? ''
	)

	if (fromIndex === -1 || toIndex === -1) return false
	if (fromIndex === toIndex) return false

	if (fromIndex < toIndex) return 'left'
	else return 'right'
}
