export default {
	'^/tagged/[a-z0-9-]+$': {
		regex: true,

		rss: (url: string) => {
			return url + '/feed'
		}
	}
}
