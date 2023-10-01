import recipes from './recipes'

export function textExtractFrom(selector: string) {
	const element = document.querySelector(selector)
	if (!element) return ''

	let text = ''

	function traverseNodes(node: Node) {
		const childNodes = node.childNodes

		for (let i = 0; i < childNodes.length; i++) {
			const child = childNodes[i]

			if (child.nodeType === Node.TEXT_NODE) {
				text += child.textContent?.trim() + ' '
			} else if (child.nodeType === Node.ELEMENT_NODE) {
				if (child.childNodes.length > 0) {
					traverseNodes(child)
				} else {
					text += child.textContent?.trim() + ' '
				}
			}
		}
	}

	traverseNodes(element)

	text = text.replace(/\\\s+/g, ' ').trim()

	text = text.slice(0, 1000)

	return text
}

export function getHost(url: string) {
	try {
		const { host } = new URL(url)
		return host
	} catch (e) {
		return ''
	}
}

export function getRecipe(url: string) {
	try {
		const host = getHost(url)
		const hostRecipes = url === '.medium.com/' ? recipes['.medium.com'] : recipes[host]

		if (hostRecipes) {
			const urlToTest = url.replace(/^https?:\/\//i, '').replace(host, '') || '/'

			for (const key in hostRecipes) {
				const regex = new RegExp(
					hostRecipes[key].regex ? key : `${key.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}.+`,
					'i'
				)
				const match = urlToTest.match(regex)

				if (key === urlToTest || match) {
					const recipe = hostRecipes[key]
					return recipe
				}
			}
		}
	} catch (e) {
		console.error(e)
	}

	return null
}
