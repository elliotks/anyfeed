<script context="module" lang="ts">
	import { fly } from 'svelte/transition'
	import { writable, type Writable } from 'svelte/store'

	const message: Writable<string> = writable('')
	const className: Writable<string> = writable('')
	let msgTimeout: ReturnType<typeof setTimeout>

	export async function send(value: string, optionalClass?: string) {
		message.set(value)
		className.set(optionalClass || '')
		msgTimeout = setTimeout(() => message.set(''), 3000)
	}

	function clear() {
		clearTimeout(msgTimeout)
		message.set('')
	}
</script>

{#if $message}
	<div
		transition:fly={{ y: -100 }}
		fixed
		z-99
		top-6
		right-6
		p-4
		md-max-w="400px"
		rounded-md
		shadow-xl
		flex-shrink-0
		inline-block
		bg-slate-200
		cursor-pointer
		font-medium
		class="!md-w-auto {$className ?? ''}"
		style="width: calc(100dvw - 48px)"
		on:click={clear}
	>
		{$message}
	</div>
{/if}
