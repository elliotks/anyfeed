<script lang="ts">
	import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte'
	import { fade, fly } from 'svelte/transition'
	import { keydown } from '$lib/window'

	export let open = false
	export let closeOnEscape = true
	export let closeOnMask = true

	$: if ($keydown?.key === 'Escape' && closeOnEscape) open = false
</script>

{#if open}
	<div
		z-1
		class="mask"
		transition:fade={{ duration: 100 }}
		on:click={() => closeOnMask && (open = false)}
	>
		<div
			block
			shadow
			bg-white
			rounded-lg
			text-sm
			z-10
			md="absolute max-w-700px min-w-400px"
			class:popover={true}
			class={$$props.class ?? ''}
			transition:fly={{ y: -100, duration: 200 }}
			on:click|stopPropagation={() => {}}
		>
			<OverlayScrollbarsComponent
				options={{
					scrollbars: {
						visibility: 'auto',
						autoHide: 'never'
					},
					overflow: {
						x: 'hidden'
					}
				}}
				class="max-h-75dvh"
			>
				<div break-words><slot /></div>
			</OverlayScrollbarsComponent>
		</div>
	</div>
{/if}

<style lang="scss">
	.mask {
		display: flex;
		align-items: center;
		justify-content: center;
		position: fixed;
		top: 0;
		left: 0;
		width: 100dvw;
		height: 100dvh;
		background: rgba(1, 1, 1, 0.5);
	}

	.popover {
		@media screen and (max-width: 768px) {
			position: relative;
			max-width: 80dvw;
		}
	}
</style>
