export function getHost(url: string) {
	const parsedUrl = new URL(url)
	return parsedUrl.hostname.split('.').slice(-2).join('.')
}

export function getFirstCharHost(url: string) {
	return getHost(url).split('.').slice(-2)[0][0].toUpperCase()
}

export function getOneOrTwoChar(name: string) {
	const words = name.trim().split(/(?=[A-Z0-9])|[^a-zA-Z0-9]/)
	const letters = words.map((word) => word[0])
	const res = letters.slice(0, 2).join('').toUpperCase()

	if (res && /^(?=.*[a-zA-Z0-9])[a-zA-Z0-9\s-]+$/.test(res)) return res
	return ''
}

export function isXPathValid(xpath: string): string {
	let manualXpathError = ''
	const xpaths = xpath.trim().split(',')

	if (!xpaths.length) manualXpathError = 'Please enter a valid XPath'
	else {
		for (const x of xpaths) {
			if (x.match(/\//) && !x.match(/^\/html\//)) {
				manualXpathError = 'Please enter a valid XPath'
			}
		}
	}

	return manualXpathError
}
