<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte'

	export let value: string = ''
	export let previousValue: string = ''
	export let placeholder: string = ''
	export let error: string = ''
	export let showEnterIcon: boolean = false
	export let hideError: boolean = false

	let input: HTMLInputElement

	const dispatch = createEventDispatcher()

	export function reset() {
		previousValue = ''
		value = ''
		error = ''
		focus()
		dispatch('reset')
	}

	export function focus() {
		input?.focus()
	}

	function handleKeyup(e: KeyboardEvent) {
		if (value !== previousValue) error = ''
		dispatch('keyup', e)
	}

	onMount(() => {
		if ($$props.focusOnMount) focus()
	})
</script>

<div class={$$props.class ?? ''}>
	<div flex class="url">
		<input
			type="text"
			w-full
			rounded-lg
			border-slate-200
			p-4
			text-sm
			shadow-sm
			outline-slate-400
			class:pr-42px={value.length || showEnterIcon}
			{placeholder}
			bind:value
			bind:this={input}
			on:keyup={handleKeyup}
			on:keydown={() => (previousValue = value)}
		/>

		<span flex="~ shrink-0 items-center" class="-ml-8" class:text-slate-400={!value}>
			{#if !value && showEnterIcon}
				<i i={'icon-park-outline-enter-key'} text-xl />
			{:else if value}
				<i i={'majesticons-close-line'} text-xl cursor-pointer on:click={reset} />
			{/if}
		</span>
	</div>
	{#if error && !hideError}
		<div text-sm mt-1 ml-2 text-red font-medium>{error}</div>
	{/if}
</div>
