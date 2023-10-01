export default function (xpath?: string): string[][] {
	const node: Record<string, unknown> = {}

	function getMainLink(element: HTMLElement) {
		// if a link is on the parent, we assume it's the right one
		if (element instanceof HTMLAnchorElement && element.href) return element.href

		// else if, we need to find the link with the most "clickable" area
		// if a link is appearing multiple times, we combine the areas
		const links: Record<string, number> = {}

		const linksElm = element.querySelectorAll('[href]')

		linksElm.forEach((elm) => {
			if (elm instanceof HTMLAnchorElement) {
				if (!links[elm.href]) links[elm.href] = 0
				const rect = elm.getBoundingClientRect()
				links[elm.href] += rect.width * rect.height
			}
		})

		// transform the object into an array
		// sort it by area
		const linksArray = Object.keys(links)
			.map((key) => ({
				href: key,
				area: links[key]
			}))
			.sort((a, b) => b.area - a.area)

		// return the first link
		return linksArray.length ? linksArray[0].href : null
	}

	function convertRelativeLink(link: string, currentUrl: string) {
		if (/^(?:[a-z]+:)?\/\//i.test(link)) return link

		if (link.startsWith('/')) {
			const currentDomain = currentUrl.split('/')[2]
			return `${currentUrl.split('//')[0]}//${currentDomain}${link}`
		}

		const currentPathSegments = currentUrl.split('/').slice(0, -1)
		const linkSegments = link.split('/')

		while (linkSegments[0] === '..') {
			currentPathSegments.pop()
			linkSegments.shift()
		}

		const absolutePath = currentPathSegments.concat(linkSegments).join('/')
		return `${currentUrl.split('//')[0]}//${currentUrl.split('/')[2]}/${absolutePath}`
	}

	function xpathQuery(xpath: string): HTMLElement | null {
		const xpathResult = document.evaluate(
			xpath,
			document,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null
		)

		if (xpathResult.singleNodeValue instanceof HTMLElement) return xpathResult.singleNodeValue
		return null
	}

	function xpathQueryAll(xpath: string): HTMLElement[] {
		const result = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null)

		const elements: HTMLElement[] = []
		let currentElement = result.iterateNext()

		while (currentElement) {
			elements.push(currentElement as HTMLElement)
			currentElement = result.iterateNext()
		}

		return elements
	}

	function xpathResolver(item: string): string {
		const elements = item.split(' ')
		let xpath = '/html/body'

		elements.forEach((element) => {
			const [tag, index] = element.split('.')
			xpath += `/${tag}[${index}]`
		})

		return xpath
	}

	function listResolver(listOrXpath: string[] | string): string[] {
		const items: string[] = []

		const rootXpath = Array.isArray(listOrXpath)
			? xpathResolver(listOrXpath[0]).replace(/\[\d+\]$/, '')
			: listOrXpath.match(/^\/html\//)
			? listOrXpath.replace(/\[\d+\]$/, '')
			: listOrXpath

		items.push(rootXpath)

		rootXpath.split(',').forEach((xpath) => {
			const elements = xpath.match(/^\/html\//)
				? xpathQueryAll(xpath)
				: (document.querySelectorAll(xpath) as unknown as HTMLElement[])

			elements.forEach((element) => {
				const link = getMainLink(element)
				const absoluteLink = link ? convertRelativeLink(link, window.location.href) : null
				if (absoluteLink) items.push(absoluteLink)
			})
		})

		return items
	}

	function mapping(element: Element, node: Record<string, unknown>): void {
		const tags: Record<string, number> = {}

		for (let i = 0; i < element.children.length; i++) {
			const child = element.children[i] as HTMLElement
			if (['script', 'svg', 'noscript'].includes(child.tagName.toLowerCase())) {
				continue
			}
			if (!tags[child.tagName]) tags[child.tagName] = 1
			else tags[child.tagName]++

			node[`${child.tagName}.${tags[child.tagName]}`] = {}

			mapping(child, node[`${child.tagName}.${tags[child.tagName]}`] as Record<string, unknown>)
		}
	}

	mapping(document.body, node)

	function levenshteinDistance(str1: string, str2: string): number {
		const m = str1.length
		const n = str2.length

		// Create a 2D matrix to store the distances
		const dp: number[][] = Array(m + 1)
			.fill(0)
			.map(() => Array(n + 1).fill(0))

		// Initialize the first row and column
		for (let i = 0; i <= m; i++) {
			dp[i][0] = i
		}

		for (let j = 0; j <= n; j++) {
			dp[0][j] = j
		}

		// Calculate the minimum edit distance
		for (let i = 1; i <= m; i++) {
			for (let j = 1; j <= n; j++) {
				if (str1[i - 1] === str2[j - 1]) {
					dp[i][j] = dp[i - 1][j - 1]
				} else {
					dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i][j - 1], dp[i - 1][j])
				}
			}
		}

		// Calculate similarity percentage
		const maxDistance = Math.max(m, n)
		const similarity = ((maxDistance - dp[m][n]) / maxDistance) * 100

		return similarity
	}

	function getStructure(node: Record<string, unknown>): string {
		const getAllKeys = (obj: Record<string, unknown>): string[] => {
			let keys: string[] = []
			for (const key in obj) {
				keys.push(key)
				if (typeof obj[key] === 'object') {
					keys = keys.concat(getAllKeys(obj[key] as Record<string, unknown>))
				}
			}
			return keys
		}

		return getAllKeys(node).join(' ')
	}

	function surface(element: HTMLElement): number {
		const rect = element.getBoundingClientRect()
		const surface = rect.width * rect.height
		return surface
	}

	function hasminimumWords(element: Node): boolean {
		if (element.nodeType === Node.TEXT_NODE) {
			const phraseRegex = /\b\w+\b/g
			const words = element.nodeValue?.match(phraseRegex)

			if (words && words.length >= 4) {
				const phrase = words.join(' ')
				const consecutiveWordsRegex = /\b\w+(\s+\w+){3,}\b/
				return consecutiveWordsRegex.test(phrase)
			}
		} else {
			for (let i = 0; i < element.childNodes.length; i++) {
				if (['script', 'svg', 'noscript'].includes(element.childNodes[i].nodeName?.toLowerCase())) {
					continue
				}
				if (hasminimumWords(element.childNodes[i])) {
					return true
				}
			}
		}

		return false
	}

	const lists: string[][] = []

	function groupFinder(node: Record<string, unknown>, path: string): void {
		for (const parentKey in node) {
			const element = node[parentKey] as Record<string, unknown>
			const groups: string[][] = []

			Object.keys(element).forEach((childKey) => {
				const structure = getStructure(element[childKey] as Record<string, unknown>)
				const groupName = childKey.split('.')[0] + ' ' + structure
				const resolvedXpath = xpathResolver(`${path} ${parentKey} ${childKey}`.toLowerCase().trim())
				const resolvedElement = xpathQuery(resolvedXpath)

				const px = resolvedElement ? surface(resolvedElement as HTMLElement) : 0
				const href = resolvedElement
					? (resolvedElement as HTMLAnchorElement).href ??
					  (resolvedElement as Element).querySelector('[href]')
					: null
				const minWords = hasminimumWords(resolvedElement as Node)

				if (groupName && href && minWords && px > 10000) {
					let pushed = false
					groups.forEach((group) => {
						const distance = levenshteinDistance(group[0], groupName)
						// % tolerance
						if (!pushed && distance > 70) {
							group.push(childKey)
							pushed = true
						}
					})
					if (!pushed) groups.push([groupName, childKey])
				} else delete element[childKey]
			})

			groups.forEach((group) => {
				// group[0] is the group structure, a structure with only one element is too simple to be interesting
				// also, a group with less than 5 items is too small to be interesting
				if (group[0].trim().split(' ').length > 1 && group.length > 5) {
					const list = group.map((childKey, index) => {
						if (index > 0) {
							delete element[childKey]
							return `${path} ${parentKey} ${childKey}`.trim().toLowerCase()
						}
					})
					list.shift()
					lists.push(list as string[])
				}
			})

			groupFinder(element, `${path} ${parentKey}`)
		}
	}

	const resolvedLists: string[][] = []

	if (!xpath) {
		groupFinder(node, '')

		lists.forEach((list) => {
			const resolvedList = listResolver(list)
			if (resolvedList.length) resolvedLists.push(resolvedList)
		})
	} else {
		const resolvedList = listResolver(xpath)
		if (resolvedList.length) resolvedLists.push(resolvedList)
	}

	return resolvedLists
}
