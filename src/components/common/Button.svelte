<script lang="ts">
	import { goto } from '$app/navigation'
	import { createEventDispatcher, onMount } from 'svelte'

	export let nude: boolean = false
	export let red: boolean = false
	export let loading: boolean = false
	export let small: boolean = false
	export let micro: boolean = false
	export let callback: (() => void) | null = null
	export let href: string | null = null

	let classes = ''

	async function execCallback() {
		if (callback && !loading) {
			loading = true
			await callback()
			loading = false
		} else {
			dispatch('click')
		}
	}

	const dispatch = createEventDispatcher()

	onMount(() => {
		if ($$props.class) classes += $$props.class + ' '
		if (!small && !micro) classes += 'px-7 h-13 text-16px text-white bg-slate-400'
		else if (small) classes += 'px-6 h-10 text-15px text-white bg-slate-100'
		else if (micro) classes += 'px-4 h-8 text-14px text-slate-500 bg-slate-100'
	})
</script>

<button
	flex="inline items-center justify-center shrink-0"
	bg="md:hover:slate-300"
	text="md:hover:slate-600"
	font-medium
	rounded-lg
	transition
	focus-outline-none
	class:nude
	class:red
	class={classes}
	on:click={() => (href ? goto(href) : execCallback())}
>
	{#if !loading}
		<slot />
	{:else}
		<i i="line-md-loading-loop" text-2xl />
	{/if}
</button>

<style lang="scss">
	button {
		outline: none !important;
	}

	.red {
		background-color: rgba(248, 113, 113, 1);
		color: #fff;

		&:hover {
			@media screen and (min-width: 768px) {
				background-color: rgba(252, 165, 165, 1);
				color: #fff;
			}
		}
	}

	.nude {
		background-color: transparent;
		color: rgba(100, 116, 139, 1);

		&:hover {
			@media screen and (min-width: 768px) {
				background-color: rgba(203, 213, 225, 1);
				color: rgba(71, 85, 105, 1);
			}
		}

		&.red {
			color: rgba(248, 113, 113, 1);

			&:hover {
				@media screen and (min-width: 768px) {
					background-color: rgba(252, 165, 165, 1);
					color: #fff;
				}
			}
		}
	}
</style>
