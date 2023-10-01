<script context="module" lang="ts">
	import { fade } from 'svelte/transition'
	import { writable, type Writable } from 'svelte/store'
	import { tick } from 'svelte'

	export const load: Writable<{ state: number }> = writable({ state: 0 })

	let loadTimeout: ReturnType<typeof setTimeout>

	export async function startLoad() {
		load.set({ state: 1 })
		await tick()

		load.set({ state: 2 })
		loadTimeout = setTimeout(() => load.set({ state: 3 }), 15000)
	}

	export function stopLoad() {
		clearTimeout(loadTimeout)
		load.set({ state: 4 })
		setTimeout(() => load.set({ state: 0 }), 500)
	}
</script>

{#if $load.state > 0}
	<div transition:fade class="loadbar" fixed w-full top-0 left-0 z-99>
		<div
			h-4px
			bg-teal-500
			class="progress {$load.state === 1
				? 'w-0'
				: $load.state === 2
				? 'w-2/3'
				: $load.state === 3
				? 'w-90p'
				: 'w-full'}"
		/>
	</div>
{/if}

<style lang="scss">
	.loadbar {
		.progress {
			transition: width 15s linear;
		}
		.progress.w-90p {
			width: 90%;
			transition: width 30s linear;
		}
		.progress.w-full {
			transition: width 0.5s linear;
		}
	}
</style>
