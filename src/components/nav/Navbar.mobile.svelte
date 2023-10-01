<script lang="ts">
	import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte'
	import SourceAvatar from '$components/SourceAvatar.svelte'
	import { dndzone } from 'svelte-dnd-action'
	import { flip } from 'svelte/animate'
	import { fade } from 'svelte/transition'
	import type { SourceDataWithId } from '$lib/db'
	import type { PreventElement } from './Navbar.svelte'

	export let overlayScrollbar: OverlayScrollbarsComponent
	export let navbar: HTMLDivElement
	export let flipDurationMs: number
	export let activeRoute: string
	export let prevent: PreventElement[]
	export let items: SourceDataWithId[]
	export let open: boolean
	export let hasScrollbar: boolean
	export let dragDisabled: boolean
	export let scrollToMobileOpen: () => void
	export let handleSourceClick: (id: number) => void
	export let handleSort: (e: any) => void
	export let close: () => void
</script>

{#if open}
	<div
		w-full
		h-100dvh
		fixed
		top-0
		left-0
		z-99
		class="mask"
		transition:fade
		on:click={() => close()}
	/>
{/if}

<div h-52px>
	{#key open}
		<OverlayScrollbarsComponent
			options={{
				scrollbars: {
					visibility: open ? 'auto' : 'hidden'
				}
			}}
			bind:this={overlayScrollbar}
			class="navbar-mobile !fixed w-full left-0 bottom-0 {open && 'z-99'}"
			style="box-shadow: rgba(17, 17, 26, 0.1) 0px 0px 16px;"
		>
			<div
				bind:this={navbar}
				flex={!open ? '~ none' : '~ wrap'}
				items-center
				min-w-full
				relative
				gap-5
				p="2 x-4"
				bg-white
				z-100
				class:open
				class:h-52px={!open}
				class="navbar"
			>
				<a on:click={() => close()} href="/settings">
					<i
						i={'ion-options-outline'}
						class:active={activeRoute.match(/^\/settings/)}
						class="source-settings"
					/>
				</a>
				<a on:click={() => close()} href="/">
					<img
						src="/anyfeed.svg"
						alt="logo"
						ml="1 md:0"
						shrink-0
						class:active={activeRoute === '/'}
						class="source-home"
					/>
				</a>
				{#if open}
					<a on:click={() => close()} href="/add/feed">
						<i
							i={'mingcute-add-fill'}
							class:active={activeRoute === '/add/feed'}
							class="source-add"
						/>
					</a>
				{/if}
				{#if open && hasScrollbar && activeRoute.match(/^\/feed\/\d+/)}
					<i
						i={'fluent-target-24-filled'}
						on:click={() => scrollToMobileOpen()}
						class="source-target"
					/>
				{/if}
				{#if !dragDisabled || open}
					{#each prevent as p}
						<div
							absolute
							w-36px
							h-36px
							z-2
							style="top: {p.top}px; left: {p.left}px"
							on:click={() => handleSourceClick(p.id)}
						/>
					{/each}
				{/if}
				{#if items.length}
					<div
						flex={!open && '~ none'}
						class="dndzone {open ? 'open w-full' : 'gap-5'}"
						use:dndzone={{
							items,
							dragDisabled: dragDisabled && !open,
							flipDurationMs,
							dropTargetStyle: {}
						}}
						on:consider={handleSort}
						on:finalize={handleSort}
					>
						{#each items as source (source.id)}
							<span
								on:click={() => handleSourceClick(source.id)}
								cursor-pointer
								shrink-0
								class:disabled={activeRoute.replace(/\/edit$/, '') !== `/feed/${source.id}`}
								class="source source-{source.id}"
								animate:flip={{ duration: flipDurationMs }}
							>
								<SourceAvatar
									data={{ ...source.avatar, url: source.url }}
									min={true}
									shadow={false}
									disabled={activeRoute.replace(/\/edit$/, '') !== `/feed/${source.id}`}
								/>
							</span>
						{/each}
					</div>
				{/if}
				{#if !open}
					<a href="/add/feed">
						<i
							i={'mingcute-add-fill'}
							class:active={activeRoute === '/add/feed'}
							class="source-add"
						/>
					</a>
				{/if}
				{#if open}<div w-full h-1px />{/if}
			</div>
		</OverlayScrollbarsComponent>
	{/key}
</div>

<style lang="scss">
	:global(.navbar-mobile [data-overlayscrollbars-viewport]) {
		display: flex;
		background: #fff;
	}

	:global(#dnd-action-dragged-el) {
		opacity: 0;
	}

	.navbar {
		@apply text-slate-500;

		&.open {
			width: 100dvw;
			padding: 20px;
			padding-bottom: 0;
			max-height: calc(100dvh - 52px);
		}

		.dndzone {
			&.open {
				display: grid;
				grid-template-columns: repeat(auto-fill, 36px);
				grid-column-gap: 20px;
				grid-template-rows: repeat(auto-fill, 36px);
				grid-row-gap: 20px;
				grid-template-rows: max-content;
			}
		}

		i,
		img {
			@apply text-5xl cursor-pointer w-8 h-8 opacity-50 transition-opacity;

			&.active {
				opacity: 100;
			}
			&:hover {
				@media screen and (min-width: 768px) {
					opacity: 100;
				}
			}
		}
	}

	.mask {
		background: rgba(1, 1, 1, 0.5);
	}

	.source {
		outline: none;
	}
</style>
