import metascraper from 'metascraper'
import metascraperDescription from 'metascraper-description'
import metascraperImage from 'metascraper-image'
import metascraperLogo from 'metascraper-logo'
import metascraperLogoFavicon from 'metascraper-logo-favicon'
import metascraperTitle from 'metascraper-title'

const scraper = metascraper([
	metascraperDescription(),
	metascraperImage(),
	metascraperLogo(),
	metascraperLogoFavicon(),
	metascraperTitle()
])

export type Meta = {
  url: string
	description: string | null
	image: string | null
	logo: string | null
	title: string | null
	name?: string
}

export default async function ({ html, url }: { html: string; url: string }) {
  const data = await scraper({ html, url })
	return { ...data, url } as unknown as Meta
}
