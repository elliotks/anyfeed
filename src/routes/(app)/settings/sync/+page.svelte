<script lang="ts">
	import { onMount } from 'svelte'
	import { fly, fade } from 'svelte/transition'
	import { navigating } from '$app/stores'
	import { scrollTop } from '$routes/+layout.svelte'
	import { sources, user } from '$lib/store'
	import TabsNav from '$components/common/TabsNav.svelte'
	import { scrollTo, scrollToMobile } from '$components/nav/Navbar.svelte'
	import { innerWidth } from '$lib/window'
	import { links } from '../+page.svelte'
	import type { JobHistorydDataWithId } from '$lib/db'
	import dayjs from 'dayjs'
	import Badge from '$components/common/Badge.svelte'
	import Button from '$components/common/Button.svelte'
	import Input from '$components/common/Input.svelte'

	let visible = !$navigating?.to
	let flyInOptions: { x?: number; y?: number; duration: number }
	let lastJobHistory: JobHistorydDataWithId[] = []
	let status: { finder: boolean; runner: boolean; time: string } = {
		finder: false,
		runner: false,
		time: ''
	}
	let end = false
	let maxHistoryError: string = ''
	let maxHistory: string = '-1'

	$: if ($user) setMaxHistory()

	onMount(() => {
		setTimeout(() => {
			if ($innerWidth > 768) scrollTo('settings')
			else scrollToMobile('settings')
		}, 1)

		if ($navigating?.from?.url.pathname.match(/^\/settings/)) {
			flyInOptions = { y: 200, duration: 400 }
		} else {
			flyInOptions = { x: -2000, duration: 300 }
		}

		visible = true

		scrollTop()

		fetch('/api/cron/history')
			.then((res) => res.json())
			.then((res) => {
				lastJobHistory = res
				if (res.length < 50) end = true
			})

		fetch('/api/cron')
			.then((res) => res.json())
			.then((res) => {
				status = res
			})
	})

	function setMaxHistory() {
		maxHistory = $user?.maxJobHistory + ''
	}

	async function navigate() {
		visible = false
		await new Promise((resolve) => setTimeout(resolve, 200))
	}

	function getSource(id: number) {
		const source = $sources.find((source) => source.id === id)
		return source
	}

	function duration(minutes: number) {
		if (minutes === 0) return '< 1 min'
		else return `${minutes} min`
	}

	function scheduledFor(createdAt: string) {
		return dayjs(createdAt).format('YYYY/MM/DD [at] HH:mm')
	}

	async function run() {
		await fetch('/api/cron', {
			method: 'POST'
		})
		document.location.reload()
	}

	async function more() {
		const res = await fetch(
			`/api/cron/history?last=${lastJobHistory[lastJobHistory.length - 1].id}`
		)
		const data = await res.json()
		lastJobHistory = [...lastJobHistory, ...data]
		if (data.length < 50) end = true
	}

	async function saveMaxHistory() {
		maxHistory = maxHistory.trim()

		if (maxHistory.match(/^\d+$/) && parseInt(maxHistory) >= 0) {
			maxHistoryError = ''

			await fetch('/api/user/me', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userData: {
						...$user,
						maxJobHistory: parseInt(maxHistory)
					}
				})
			})

			document.location.reload()
		} else {
			maxHistoryError = 'Invalid number'
		}
	}
</script>

{#if visible}
	<div transition:fade={{ duration: 500 }}>
		<div in:fly={flyInOptions} out:fly={{ y: 200, duration: 400 }} mx-auto max-w-lg p-4 md-mt-4>
			<TabsNav {links} {navigate} />
			<h1 flex items-center text="xl left slate-800" font-bold mt="4 md:8">
				<i i="	eos-icons-cronjob" /> <span ml-4>Cron status</span>
				<span
					rounded-full
					m="l-4 t-1"
					w-3
					h-3
					class={status.finder && status.runner ? 'bg-teal-500' : 'bg-red'}
				/>
				{#if !status.finder || !status.runner}
					<Badge class="ml-4 mt-1" close={false} callback={run}>Run</Badge>
				{/if}
				{#if status.finder && status.runner && status.time}
					<span ml-4 mt-1 font-normal text-sm>{status.time}</span>
				{/if}
			</h1>
			<h1 flex items-center text="xl left slate-800" font-bold mt="4 md:8">
				<i i="	ooui-reload" /> <span ml-4>Last auto sync</span>
			</h1>
			<div text="14px slate-400" mt-4>
				Configure the maximum number of elements to be retained in the database. Set 0 to disable
				history.
			</div>
			<div mt-4 gap-4 flex>
				<Input flex-grow bind:value={maxHistory} error={maxHistoryError} />
				<Button shrink-0 callback={saveMaxHistory}><i i="ci-save" /></Button>
			</div>
			<div bg-white rounded-lg p-4 mt="4 md:8">
				{#each lastJobHistory as job}
					<a
						href="/feed/{job.sourceId}/edit"
						class="job"
						block
						mb-4
						p-2
						rounded-lg
						cursor-pointer
						select-none
						class:bg-slate-100={job.status !== 'failed'}
						class:bg-red-100={job.status === 'failed'}
					>
						<div font-medium whitespace-nowrap overflow-hidden text-ellipsis mb-2>
							{(getSource(job.sourceId)?.url || '').replace(/^https?:\/\//i, '')}
						</div>
						<div flex items-center>
							<i i="	mingcute-time-line" mr-2 />
							{scheduledFor(job.createdAt)}
						</div>
						<div flex items-center justify-between>
							<div flex items-center>
								<i i="	ic-round-hourglass-bottom" mr-2 />
								{duration(dayjs(job.updatedAt).diff(dayjs(job.createdAt), 'minute'))}
							</div>
							<div ml-1 capitalize font-medium class:text-red={job.status === 'failed'}>
								{job.status.replace('completed:', 'completed, found: ')}
							</div>
						</div>
					</a>
				{/each}
				{#if !lastJobHistory.length}
					<div text="center slate-500">No history</div>
				{/if}
			</div>
			{#if lastJobHistory.length}
				<div p-4 text-center>
					{#if !end}
						<Button w-full callback={more}><i i="mingcute-add-fill" mr-4 />More</Button>
					{:else}
						<span text-slate-500>No more</span>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style lang="scss">
	.job {
		&:last-child {
			margin-bottom: 0 !important;
		}
	}
</style>
