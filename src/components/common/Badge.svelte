<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	export let close: boolean = true
	export let loading: boolean = false
	export let callback: (() => void) | null = null
	export let hover: boolean = !callback

	async function execCallback() {
		if (callback && !loading) {
			loading = true
			await callback()
			loading = false
		}
	}

	const dispatch = createEventDispatcher()
</script>

<div
	border-slate-200
	divide-slate-200
	font-medium
	flex="inline items-center justify-center"
	p="l-3.5 y-0.5"
	text="sm slate-500"
	bg="slate-100"
	rounded
	max-w-full
	class:hover-slate-200={hover}
	class:pr-14px={!close}
	class:cursor-pointer={!loading && callback}
	class={$$props.class ?? ''}
	on:click={execCallback}
>
	<div whitespace-nowrap overflow-hidden text-ellipsis>
		{#if loading}
			<i i="line-md-loading-loop" mb-3px />
		{:else}
			<slot />
		{/if}
	</div>
	{#if close}
		<button
			type="button"
			hover="text-slate-900 bg-slate-200"
			focus="outline-none ring-1"
			whitespace-normal
			m-1
			rounded
			p-1
			text-slate-500
			mx-2
			aria-label="Close"
			on:click|stopPropagation={() => dispatch('close')}
		>
			<svg
				class="w-3.5 h-3.5"
				fill="currentColor"
				viewBox="0 0 20 20"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					fill-rule="evenodd"
					d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
					clip-rule="evenodd"
				/>
			</svg>
		</button>
	{/if}
</div>
