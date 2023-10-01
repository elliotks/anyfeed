<script lang="ts">
	import { onMount } from 'svelte'
	import { fly, fade } from 'svelte/transition'
	import { navigating, page } from '$app/stores'
	import Announcement from '$components/common/Announcement.svelte'
	import Input from '$components/common/Input.svelte'
	import Button from '$components/common/Button.svelte'
	import Card from '$components/feed/Card.svelte'
	import CardLoad from '$components/feed/Card.load.svelte'
	import type { Meta } from '$lib/extract/getMeta'
	import { getHost, isXPathValid } from '$lib/utils'
	import { scrollTop } from '$routes/+layout.svelte'
	import { user, sources } from '$lib/store'
	import Info from '$components/common/Info.svelte'
	import { scrollTo, scrollToMobile } from '$components/nav/Navbar.svelte'
	import { innerWidth } from '$lib/window'
	import { cronExpression, frequencyValidation, type Frequency } from '$lib/cron/utils'
	import AvatarCustomization from '$components/AvatarCustomization.svelte'
	import SetFrequency from '$components/SetFrequency.svelte'
	import type { AvatarData } from '$components/common/avatar.types'
	import FeedUrlForm from '$components/add/FeedUrlForm.svelte'

	type View = 'url' | 'preview' | 'none' | '404' | '500'

	let avatar: AvatarData = {
		type: 'text',
		logo: '',
		text: '',
		color: '#64758B',
		background: '#FFFFFF'
	}

	let checkLoading: boolean = false
	let customFrequency: string = ''
	let customFrequencyError: string = ''
	let feedPreview: Meta | null = null
	// form is used to rerender the form with/out the directive trapFocus (mess with the swipe and transition)
	let form = false
	let frequency: Frequency = 'once'
	let frequencyAnd: number = 6
	let frequencyAt: number = 6
	let manualXpath: boolean = false
	let manualXpathError: string = ''
	let name: string = ''
	let nameError = ''
	let rss: string = ''
	let saveLoading: boolean = false
	let url: string = ''
	let urlError = ''
	let urls: string[] = []
	let view: View = 'url'
	let visible = !$navigating?.to
	let xpath: string = ''
	let xpathHelp: boolean = false
	let xpathInput: Input

	async function showPreview(e?: CustomEvent<KeyboardEvent>) {
		if (!e || e.detail.key === 'Enter') {
			e?.detail.preventDefault()

			if (manualXpath) {
				manualXpathError = isXPathValid(xpath)

				if (manualXpathError) {
					if (!url) urlError = 'Please enter a valid URL'
					return
				}
			}

			nameError = ''
			customFrequencyError = ''

			try {
				const withHttps = url.replace(/^(?:(.*:)?\/\/)?(.*)/i, (match, schemma, nonSchemmaUrl) =>
					schemma ? match : `https://${nonSchemmaUrl}`
				)
				url = withHttps.trim().toLowerCase()
				if (
					!/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(
						url
					)
				) {
					throw new Error('Invalid URL')
				}

				// if the url is ok we continue
				view = 'none'
				setTimeout(() => (view = 'preview'), 300)
				checkLoading = true

				fetch('/api/extract/findContent', {
					method: 'POST',
					body: JSON.stringify({
						url,
						xpath: xpath.trim(),
						maxLastFeed: $user?.maxTotalFeedPerSource
					}),
					headers: {
						'Content-Type': 'application/json'
					}
				})
					.then(async (res) => {
						if (res.ok && checkLoading) {
							const data = (await res.json()) as {
								metadata: Meta
								path: string
								urls: string[]
								realUrl?: string
							}
							checkLoading = false

							if (!data.path || !data.metadata) {
								setTimeout(() => (view = '404'), 300)
								return
							}

							if (!data.path.match(/^(https?|ftp):/)) xpath = data.path
							else rss = data.path

							urls = data.urls

							if (data.realUrl) {
								url = data.realUrl
							}

							setTimeout(() => {
								feedPreview = data.metadata

								if (feedPreview.logo) {
									avatar.type = 'logo'
								}

								if (feedPreview.name) {
									name = feedPreview.name
								}
							}, 400)
						} else {
							checkLoading = false
							setTimeout(() => (view = '500'), 300)
						}
					})
					.catch(() => {
						checkLoading = false
						setTimeout(() => (view = '500'), 300)
						return
					})
			} catch (_e) {
				urlError = 'Please enter a valid URL'
			}
		}
	}

	function showUrl() {
		checkLoading = false
		feedPreview = null
		view = 'none'
		name = ''
		xpath = ''
		rss = ''

		setTimeout(async () => {
			view = 'url'
		}, 200)
	}

	async function save() {
		saveLoading = true
		let error = false

		name = name.trim()

		// frequency validation
		customFrequencyError = frequencyValidation({
			frequency: frequency,
			frequencyAt: frequencyAt,
			frequencyAnd: frequencyAnd,
			customFrequency: customFrequency
		})
		if (customFrequencyError) error = true

		if (error) {
			saveLoading = false
			return
		}

		// we can save
		const sourceData = {
			userId: $user?.id,
			url,
			name,
			xpath,
			rss,
			cron: cronExpression({
				frequency: frequency,
				frequencyAt: frequencyAt,
				frequencyAnd: frequencyAnd,
				customFrequency: customFrequency
			}),
			maxLastFeed: null,
			avatar: JSON.stringify({
				type: avatar.type,
				logo: avatar.logo || feedPreview?.logo || '',
				text: avatar.text,
				color: avatar.color,
				background: avatar.background
			}),
			displayOnHome: true
		}

		await fetch('/api/source', {
			method: 'POST',
			body: JSON.stringify({ sourceData, feedPreview: feedPreview, urls: urls }),
			headers: {
				'Content-Type': 'application/json'
			}
		}).catch(() => {
			saveLoading = false
			return
		})

		await new Promise((resolve) => setTimeout(resolve, 1000))

		document.location.href = '/'
	}

	onMount(async () => {
		setTimeout(() => {
			if ($innerWidth > 768) scrollTo('add')
			else scrollToMobile('add')
		}, 1)
		visible = true
		scrollTop()

		const urlParam = $page.url.searchParams.get('url')
		if (urlParam) {
			// reset the state
			checkLoading = false
			feedPreview = null
			view = 'none'
			name = ''
			xpath = ''
			rss = ''

			// set url and show
			url = urlParam
			showPreview()
		} else {
			setTimeout(() => (form = true), 300)
		}
	})

	$: if (manualXpath) xpathInput?.focus()
</script>

{#if visible}
	<div mb-5 transition:fade={{ duration: 500 }}>
		<div transition:fly={{ x: 2000, duration: 300 }}>
			{#if view === 'url'}
				<FeedUrlForm
					bind:form
					bind:manualXpath
					bind:manualXpathError
					{showPreview}
					bind:url
					bind:urlError
					bind:xpath
					bind:xpathHelp
					bind:xpathInput
				/>
			{/if}

			{#if ['preview', '404', '500'].includes(view)}
				<div sticky top-0 z-10 transition:fade={{ duration: 100 }}>
					<Announcement text={url} on:close={showUrl} />
				</div>
				<div
					transition:fly={{ y: 100, duration: 200 }}
					class="preview"
					text-center
					mx-auto
					max-w-lg
					p-4
				>
					{#if feedPreview}
						<h1 transition:fade flex items-center text="xl left slate-800" font-bold mt="6 md:8">
							<i i="	heroicons-newspaper" /> <span ml-4>Latest content found</span>
						</h1>
					{/if}

					{#if view === '404'}
						<h1 transition:fade text="xl slate-800" font-medium mt="6 md:8">No content found 🫣</h1>
						{#if !manualXpath}
							<div mt-8>You may provide a XPath</div>
						{:else}
							<div mt-8>You may try with a different XPath</div>
						{/if}
					{/if}

					{#if view === '500'}
						<h1 transition:fade text="xl slate-800" font-medium mt="6 md:8">
							Something went wrong 😱
						</h1>
						<div mt-8>
							Verify if the URL provided is accessible
							{#if manualXpath} and if your XPath is correct{/if}
						</div>
					{/if}

					{#if feedPreview}
						<div mt="6 md:8" mx-auto text-left transition:fade>
							<Card
								data={{
									...feedPreview,
									name: name,
									avatar: {
										...avatar,
										logo: avatar.logo || feedPreview.logo || '/default_avatar.png'
									},
									sourceUrl: url,
									bookmark: false
								}}
								hover={false}
								menu={false}
							/>
						</div>
						{#if $sources.length < 4}
							<Info class="mt-4">
								By adding this source, the content found above will appear in your feed, but not the
								previous ones. In the upcoming updates, newly content will be fetched.
							</Info>
						{/if}
					{/if}

					{#if checkLoading}
						<div mt="6 md:8" mx-auto text-left transition:fade>
							<CardLoad noDate={true} />
						</div>
					{/if}

					{#if feedPreview}
						<div text-left transition:fade>
							<div
								w-full
								h-px
								bg-slate-200
								my="10 md:12"
								style="opacity: 1; transform-origin: 0% 50% 0px;"
							/>
							<h1 flex items-center text="xl slate-800" font-medium>
								<i i="	material-symbols-rss-feed-rounded" /> <span ml-4>Follow this feed</span>
							</h1>

							<h3 text="lg slate-500" mt="6 md:8" mb-4>Name</h3>
							<Input placeholder={getHost(url)} bind:value={name} bind:error={nameError} />

							<h3 text="lg slate-500" mt="6 md:8">Appearance</h3>
							<AvatarCustomization
								bind:avatar
								bind:name
								bind:url
								logoPreview={feedPreview.logo || ''}
							/>

							<h3 text="lg slate-500" mt="6 md:8">Update frequency</h3>
							<SetFrequency
								bind:frequency
								bind:frequencyAt
								bind:frequencyAnd
								bind:customFrequency
								bind:customFrequencyError
							/>

							<div flex="~ wrap gap-4" w-full mt-10>
								<Button on:click={showUrl} nude class="w-full md:w-auto order-last md:order-first">
									Cancel
								</Button>
								<Button on:click={save} loading={saveLoading} class="flex-grow">
									<i i={'ci-save'} mr-4 />Save
								</Button>
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/if}
