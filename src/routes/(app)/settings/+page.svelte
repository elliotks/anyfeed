<script context="module" lang="ts">
	export const links = [
		{
			name: 'Settings',
			href: '/settings'
		},
		{
			name: 'Sync history',
			href: '/settings/sync'
		}
	]
</script>

<script lang="ts">
	import { onMount } from 'svelte'
	import { fly, fade } from 'svelte/transition'
	import { navigating } from '$app/stores'
	import { scrollTop } from '$routes/+layout.svelte'
	import { user } from '$lib/store'
	import Toggle from '$components/common/Toggle.svelte'
	import Input from '$components/common/Input.svelte'
	import Button from '$components/common/Button.svelte'
	import Modal from '$components/common/Modal.svelte'
	import TabsNav from '$components/common/TabsNav.svelte'
	import { scrollTo, scrollToMobile } from '$components/nav/Navbar.svelte'
	import { innerWidth } from '$lib/window'

	export let data

	let visible = !$navigating?.to
	let swipeUI = data.user?.swipeUI
	let maxLastFeedPerSource = data.user?.maxLastFeedPerSource + ''
	let maxLastFeedPerSourceError: string = ''
	let maxTotalFeedPerSource = data.user?.maxTotalFeedPerSource + ''
	let maxTotalFeedPerSourceError: string = ''
	let showSave: boolean = false
	let flyInOptions: { x?: number; y?: number; duration: number }

	onMount(() => {
		setTimeout(() => {
			if ($innerWidth > 768) scrollTo('settings')
			else scrollToMobile('settings')
		}, 1)

		if ($navigating?.from?.url.pathname.match(/^\/settings/)) {
			flyInOptions = { y: -200, duration: 400 }
		} else {
			flyInOptions = { x: -2000, duration: 300 }
		}

		visible = true

		scrollTop()
	})

	async function navigate() {
		visible = false
		await new Promise((resolve) => setTimeout(resolve, 200))
	}

	async function toggleSwiperUI(value: boolean) {
		if ($user) {
			$user.swipeUI = value

			await fetch('/api/user/me', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userData: $user })
			})

			await new Promise((resolve) => setTimeout(resolve, 500))
			location.reload()
		}
	}

	async function save(ask: boolean = false) {
		if ($user) {
			maxLastFeedPerSource = maxLastFeedPerSource.trim()
			maxTotalFeedPerSource = maxTotalFeedPerSource.trim()

			if (maxLastFeedPerSource.match(/^\d+$/) && maxTotalFeedPerSource.match(/^\d+$/)) {
				if (parseInt(maxLastFeedPerSource) > parseInt(maxTotalFeedPerSource)) {
					maxTotalFeedPerSourceError =
						'The maximum number of elements per feed must be greater or equal than the maximum number of recent elements per feed.'
					return
				} else if (parseInt(maxLastFeedPerSource) < 1) {
					maxLastFeedPerSourceError = 'This field must be greater than 0.'
					return
				} else {
					maxLastFeedPerSourceError = ''
					maxTotalFeedPerSourceError = ''

					if (ask && parseInt(maxTotalFeedPerSource) < $user.maxTotalFeedPerSource) {
						showSave = true
						return
					}
				}
			} else {
				if (!maxLastFeedPerSource.match(/^\d+$/))
					maxLastFeedPerSourceError = 'This field must be a number.'
				if (!maxTotalFeedPerSource.match(/^\d+$/))
					maxTotalFeedPerSourceError = 'This field must be a number.'
				return
			}

			$user.maxLastFeedPerSource = parseInt(maxLastFeedPerSource)
			$user.maxTotalFeedPerSource = parseInt(maxTotalFeedPerSource)

			await fetch('/api/user/me', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userData: $user })
			})

			await new Promise((resolve) => setTimeout(resolve, 500))

			showSave = false
		}
	}
</script>

{#if visible}
	<div transition:fade={{ duration: 500 }}>
		<div in:fly={flyInOptions} out:fly={{ y: -200, duration: 400 }} mx-auto max-w-lg p-4 md-mt-4>
			<TabsNav {links} {navigate} />
			<h1 flex items-center text="xl left slate-800" font-bold mt="4 md:8">
				<i i="	icomoon-free-lab" /> <span ml-4>Experimental</span>
			</h1>
			<div bg-white rounded-lg p-4 mt="4 md:8">
				<div flex gap-4 items-center h-13>
					<Toggle bind:value={swipeUI} callback={toggleSwiperUI} />
					<span>Trackpad swipe UI</span>
				</div>
				<div mt-2 text-14px>
					Enable a swipeable user interface in desktop views, allowing seamless switching between
					your feeds with a simple gesture on your trackpad.
					<br /><br />
					<span font-medium>
						Please note that this feature is experimental and may not be compatible with browsers
						that are not based on Chromium.
					</span>
				</div>
			</div>

			<h1 flex items-center text="xl left slate-800" font-bold mt="6 md:8">
				<i i="	material-symbols-rss-feed-rounded" /> <span ml-4>Default feeds settings</span>
			</h1>

			<h3 text="lg slate-500" mt="4 md:6" mb-2>Total of elements per feed</h3>
			<div text="14px slate-400">
				Set the maximum number of elements for a feed in database. It must be greater (or equal)
				than the maximum number of recent elements per feed. <b
					>When set, past elements that exceed this limit will be deleted.</b
				>
			</div>
			<Input class="mt-4" bind:value={maxTotalFeedPerSource} error={maxTotalFeedPerSourceError} />

			<h3 text="lg slate-500" mt="4 md:6" mb-2>Max elements per sync</h3>
			<div text="14px slate-400">
				Set the maximum number of elements retrieved when synchronizing a feed.
			</div>
			<Input class="mt-4" bind:value={maxLastFeedPerSource} error={maxLastFeedPerSourceError} />

			<div flex="~ wrap" w-full mt="10 md:12">
				<Button class="flex-grow" callback={() => save(true)}>
					<i i={'ci-save'} mr-4 />Save
				</Button>
			</div>
		</div>
	</div>
{/if}

<Modal bind:open={showSave}>
	<div p-6>
		<div text-16px>
			You have set your maximum number of elements per feed lower than the previous one. Past
			elements that exceed this limit will be deleted. Do you want to proceed?
		</div>
		<div flex="~ wrap justify-center" w-full mt-6 gap-4>
			<Button on:click={() => (showSave = false)} nude small>No</Button>
			<Button callback={save} red small>Yes</Button>
		</div>
	</div>
</Modal>
