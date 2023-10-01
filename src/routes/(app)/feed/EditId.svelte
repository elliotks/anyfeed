<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import { fly, fade } from 'svelte/transition'
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import Input from '$components/common/Input.svelte'
	import Button from '$components/common/Button.svelte'
	import Modal from '$components/common/Modal.svelte'
	import Badge from '$components/common/Badge.svelte'
	import Toggle from '$components/common/Toggle.svelte'
	import Top from '$components/feed/Top.svelte'
	import Floating from '$components/feed/Floating.svelte'
	import Card from '$components/feed/Card.svelte'
	import { scrollTo, scrollToMobile } from '$components/nav/Navbar.svelte'
	import { getHost, isXPathValid } from '$lib/utils'
	import { scrollTop } from '$routes/+layout.svelte'
	import { user, sources } from '$lib/store'
	import type { SourceDataWithId } from '$lib/db'
	import type { Meta } from '$lib/extract/getMeta'
	import type { AvatarData } from '$components/common/avatar.types'
	import { innerWidth } from '$lib/window'
	import {
		cronExpression,
		decodeCronExpression,
		frequencyValidation,
		type Frequency
	} from '$lib/cron/utils'
	import AvatarCustomization from '$components/AvatarCustomization.svelte'
	import SetFrequency from '$components/SetFrequency.svelte'

	let avatar: AvatarData = {
		type: '',
		logo: '',
		text: '',
		color: '',
		background: ''
	}
	let customFrequency: string = ''
	let customFrequencyError: string = ''
	let displayOnHome: boolean = true
	let frequency: Frequency = 'once'
	let frequencyAnd: number = 6
	let frequencyAt: number = 6
	let maxLastFeed: string = ''
	let maxLastFeedError: string = ''
	let maxTotalFeed: string = ''
	let maxTotalFeedError: string = ''
	let metadata: Meta | null = null
	let metadataError: string = ''
	let name: string = ''
	let nameError = ''
	let position: string = ''
	let positionError: string = ''
	let rss: string = ''
	let saveLoading: boolean = false
	let showDelete: boolean = false
	let showMetadata: boolean = false
	let url: string = ''
	let visible = false
	let xpath: string = ''
	let xpathError: string = ''

	function init() {
		if (!source) return

		let decodedCron
		if (source.cron) {
			decodedCron = decodeCronExpression(source.cron)
		}

		url = source.url
		name = source.name
		xpath = source.xpath || ''
		rss = source.rss || ''
		maxTotalFeed = source.maxTotalFeed?.toString() || ''
		maxLastFeed = source.maxLastFeed?.toString() || ''
		displayOnHome = source.displayOnHome
		avatar = source.avatar

		nameError = ''

		if (!decodedCron) frequency = 'manual'
		else {
			if (decodedCron.frequency) frequency = decodedCron.frequency
			if (decodedCron.frequencyAt) frequencyAt = decodedCron.frequencyAt
			if (decodedCron.frequencyAnd) frequencyAnd = decodedCron.frequencyAnd
			if (frequency === 'custom' && source.cron) customFrequency = source.cron
		}

		customFrequencyError = ''

		setTimeout(async () => {
			visible = true
		}, 200)
	}

	function close() {
		visible = false
		setTimeout(async () => {
			goto(`/feed/${source?.id}`)
		}, 300)
	}

	async function checkXpath() {
		metadata = null
		metadataError = ''

		xpathError = isXPathValid(xpath)
		if (xpathError) return

		const res = await fetch('/api/extract/findContent', {
			method: 'POST',
			body: JSON.stringify({ url: url, xpath: xpath, maxLastFeed: $user?.maxLastFeedPerSource }),
			headers: {
				'Content-Type': 'application/json'
			}
		})
		if (!res.ok) {
			const { error } = await res.json()
			metadataError = error
			showMetadata = true
		} else {
			res
				.json()
				.then((data: { metadata: Meta }) => {
					if (data.metadata) metadata = data.metadata
					else metadataError = 'No content found with this XPath :('

					showMetadata = true
				})
				.catch((e) => {
					console.log(e)
					metadataError = 'Error while fetching metadata'
				})
		}
	}

	async function save() {
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

		if (rss) {
			xpath = ''
		} else {
			// xpath validation
			xpathError = isXPathValid(xpath)
			if (xpathError) error = true
			xpath = xpath.trim()
		}

		if (
			!position.match(/^\d+$/) ||
			parseInt(position) < 1 ||
			parseInt(position) > $sources.length
		) {
			positionError = 'Please enter a valid position'
			error = true
		}

		maxTotalFeed = maxTotalFeed.trim()
		maxLastFeed = maxLastFeed.trim()
		maxTotalFeedError = ''
		maxLastFeedError = ''

		if (maxTotalFeed && !maxTotalFeed.match(/^\d+$/)) {
			maxTotalFeedError = 'Please enter a valid number'
			error = true
		} else if (maxTotalFeed) {
			if (parseInt(maxTotalFeed) < 1) {
				maxLastFeedError = 'This field must be greater than 0.'
				error = true
			} else if (
				(maxLastFeed &&
					maxLastFeed.match(/^\d+$/) &&
					parseInt(maxTotalFeed) < parseInt(maxLastFeed)) ||
				($user && parseInt(maxTotalFeed) < $user?.maxLastFeedPerSource)
			) {
				maxTotalFeedError =
					'This field must be greater or equal than the maximum number of recent elements'
				error = true
			}
		}

		if (maxLastFeed && !maxLastFeed.match(/^\d+$/)) {
			maxLastFeedError = 'Please enter a valid number'
			error = true
		}

		if (error) return

		saveLoading = true

		// we can save
		const sourceData = {
			id: source?.id,
			userId: $user?.id,
			url: url,
			name: name,
			xpath: xpath,
			rss: rss,
			avatar: {
				type: avatar.type,
				logo: avatar.logo || '',
				text: avatar.text,
				color: avatar.color,
				background: avatar.background
			},
			cron: cronExpression({
				frequency: frequency,
				frequencyAt: frequencyAt,
				frequencyAnd: frequencyAnd,
				customFrequency: customFrequency
			}),
			displayOnHome: displayOnHome,
			maxTotalFeed: maxTotalFeed ? parseInt(maxTotalFeed) : null,
			maxLastFeed: maxLastFeed ? parseInt(maxLastFeed) : null
		}

		await fetch('/api/source', {
			method: 'PUT',
			body: JSON.stringify({
				sourceData: { ...sourceData, avatar: JSON.stringify(sourceData.avatar) }
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		}).catch(() => {
			saveLoading = false
			return
		})

		if ($user?.navOrder) {
			let orders = $user.navOrder.split(',')
			let index = orders.indexOf($page.params.sourceId)
			orders.splice(index, 1)
			orders.splice(parseInt(position) - 1, 0, $page.params.sourceId)
			$user.navOrder = orders.join(',')
		}

		fetch('/api/user/me', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				userData: {
					...$user
				}
			})
		})

		sources.update((sources) => {
			const index = sources.findIndex((s) => s.id === source?.id)
			if (index !== -1) sources[index] = sourceData as SourceDataWithId
			return sources
		})

		await new Promise((resolve) => setTimeout(resolve, 500))

		saveLoading = false

		document.location.href = `/feed/${source?.id}`
	}

	async function remove() {
		await fetch('/api/source', {
			method: 'DELETE',
			body: JSON.stringify({ sourceData: source }),
			headers: {
				'Content-Type': 'application/json'
			}
		})

		await new Promise((resolve) => setTimeout(resolve, 500))

		document.location.href = '/'
	}

	function setOrder() {
		if ($user) {
			const i = $user.navOrder?.split(',').indexOf($page.params.sourceId)
			if (i !== -1 && typeof i !== 'undefined') position = `${i + 1}`
		}
	}

	onMount(async () => {
		setTimeout(() => {
			if ($innerWidth > 768) scrollTo($page.params.sourceId)
			else scrollToMobile($page.params.sourceId)
		}, 1)

		scrollTop()
	})

	onDestroy(() => {
		visible = false
	})

	$: if ($user?.navOrder) setOrder()
	$: source = $sources.find((source) => source.id === +$page.params.sourceId)
	$: if (source) init()
</script>

{#if visible}
	<div mb-5>
		<Floating childPage="edit" {source} {close} />
		<div transition:fly={{ y: 100, duration: 200 }} class="preview" text-center mx-auto max-w-lg>
			<Top childPage="edit" {source} {close} />
			<div text-left p-4 transition:fade>
				<h1 flex items-center text="xl left slate-800" font-bold mt="2 md:4">
					<i i="	material-symbols-rss-feed-rounded" /> <span ml-4>Edit this feed</span>
				</h1>

				<h3 text="lg slate-500" mt="7 md:8" mb-4>Name</h3>
				<Input placeholder={getHost(url)} bind:value={name} bind:error={nameError} />

				<h3 text="lg slate-500" mt="7 md:8" mb-4>Appearance</h3>
				<AvatarCustomization bind:avatar bind:name bind:url />

				<div flex="~ wrap">
					<div w="full md:1/2">
						<h3 text="lg slate-500" mt="7 md:8" mb-4>Display on home</h3>
						<div flex mt-4><Toggle bind:value={displayOnHome} /></div>
					</div>
					<div>
						<h3 text="lg slate-500" mt="7 md:8" mb-4>Position</h3>
						<Input class="mt-4 w-full md:w-1/2" bind:error={positionError} bind:value={position} />
					</div>
				</div>

				<h3 text="lg slate-500" mt="7 md:8" mb-4>Update frequency</h3>
				<SetFrequency
					bind:frequency
					bind:frequencyAt
					bind:frequencyAnd
					bind:customFrequency
					bind:customFrequencyError
				/>

				<h3 text="lg slate-500" mt="4 md:6" mb-2>Total of elements</h3>
				<div text="14px slate-400">
					Set the maximum number of elements for this feed in database. It must be greater (or
					equal) than the maximum number of recent elements. <b
						>When set, past elements that exceed this limit will be deleted.</b
					>
				</div>
				<Input
					class="mt-4"
					type="number"
					bind:value={maxTotalFeed}
					error={maxTotalFeedError}
					placeholder={`${$user?.maxTotalFeedPerSource}`}
				/>

				<h3 text="lg slate-500" mt="4 md:6" mb-2>Max elements per sync</h3>
				<div text="14px slate-400" >
					Set the maximum number of elements retrieved when synchronizing.
				</div>
				<Input
					class="mt-4"
					bind:value={maxLastFeed}
					error={maxLastFeedError}
					placeholder={`${$user?.maxLastFeedPerSource}`}
				/>

				{#if !rss}
					<h3 text="lg slate-500" mt="7 md:8" mb-4>
						XPath/selector <Badge close={false} callback={checkXpath} class="ml-4">
							<i i="iconamoon-check-bold" mb-3px mr-2 /><span>Check</span>
						</Badge>
					</h3>
					<Input
						placeholder="Root XPath of a recurring element"
						bind:value={xpath}
						bind:error={xpathError}
					/>
				{/if}

				<div flex="~ wrap gap-4" w-full mt-10>
					<Button
						nude
						red
						w="full md:auto"
						order="last md:first"
						on:click={() => (showDelete = true)}><i i={'ion-trash-outline'} mr-4 />Delete</Button
					>
					<Button on:click={save} loading={saveLoading} class="flex-grow">
						<i i={'ci-save'} mr-4 />Save
					</Button>
				</div>
			</div>
		</div>
	</div>
	<Modal bind:open={showDelete}>
		<div p-6>
			<div text-16px font-medium>Are you sure? All your feed related data will be deleted.</div>
			<div flex="~ wrap justify-center" w-full mt-6 gap-4>
				<Button on:click={() => (showDelete = false)} nude small>No</Button>
				<Button callback={remove} red small>Yes</Button>
			</div>
		</div>
	</Modal>
	{#if metadata || metadataError}
		<Modal bind:open={showMetadata}>
			<div p-6>
				{#if metadataError}
					<div font-medium>{metadataError}</div>
				{:else if metadata}
					<h3 text="lg slate-500 center" mb-4>Latest content found</h3>
					<Card
						data={{
							...metadata,
							name: name,
							sourceUrl: url,
							avatar: avatar,
							bookmark: false
						}}
						hover={false}
						menu={false}
						class="max-w-500px"
					/>
				{/if}
			</div>
		</Modal>
	{/if}
{/if}
