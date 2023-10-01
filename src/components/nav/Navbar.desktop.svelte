<script lang="ts">
	import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte'
	import SourceAvatar from '$components/SourceAvatar.svelte'
	import { dndzone } from 'svelte-dnd-action'
	import { flip } from 'svelte/animate'
	import type { SourceDataWithId } from '$lib/db'
	import type { PreventElement } from './Navbar.svelte'

	export let overlayScrollbar: OverlayScrollbarsComponent
	export let navbar: HTMLDivElement
	export let flipDurationMs: number
	export let activeRoute: string
	export let prevent: PreventElement[]
	export let items: SourceDataWithId[]
	export let hover: number | null
	export let dragging: boolean
	export let handleSourceClick: (id: number) => void
	export let handleSort: (e: any) => void
</script>

<OverlayScrollbarsComponent
	options={{
		scrollbars: {
			visibility: 'hidden'
		}
	}}
	bind:this={overlayScrollbar}
	class="h-full"
	style="box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;"
>
	<div
		class="navbar"
		flex="~ md:col items-center shrink-0"
		w="~ md:13 full"
		min-h-full
		gap="5 md:4"
		p="2 x-4 md:x-2"
		bg-white
		bind:this={navbar}
	>
		<a href="/settings" md-mt-1>
			<i
				i={'ion-options-outline'}
				class:active={activeRoute.match(/^\/settings/)}
				class="source-settings"
			/>
		</a>
		<a href="/">
			<img
				src="/anyfeed.svg"
				alt="logo"
				ml="1 md:0"
				class:active={activeRoute === '/'}
				class="source-home"
			/>
		</a>
		{#each prevent as p}
			<div
				absolute
				w-36px
				h-36px
				z-2
				cursor-pointer
				style="top: {p.top}px; left: {p.left}px"
				on:click={() => handleSourceClick(p.id)}
				on:mouseover={() => (hover = p.id)}
				on:mouseleave={() => (hover = null)}
			/>
		{/each}
		{#if items.length}
			<div
				flex="~ md:col items-center shrink-0"
				gap="5 md:4"
				use:dndzone={{
					items,
					flipDurationMs,
					dropTargetStyle: {}
				}}
				on:consider={handleSort}
				on:finalize={handleSort}
			>
				{#each items as source (source.id)}
					<span
						on:mousedown={() => (dragging = true)}
						on:mouseup={() => (dragging = false)}
						on:click={() => handleSourceClick(source.id)}
						class:disabled={activeRoute.replace(/\/edit$/, '') !== `/feed/${source.id}`}
						class="{dragging ? '!cursor-grabbing' : '!cursor-grab'} source-{source.id}"
						animate:flip={{ duration: flipDurationMs }}
					>
						<SourceAvatar
							data={{ ...source.avatar, url: source.url }}
							min={true}
							shadow={false}
							disabled={activeRoute.replace(/\/edit$/, '') !== `/feed/${source.id}` &&
								hover !== source.id}
						/>
					</span>
				{/each}
			</div>
		{/if}
		<a href="/add/feed">
			<i i={'mingcute-add-fill'} class:active={activeRoute === '/add/feed'} class="source-add" />
		</a>
	</div>
</OverlayScrollbarsComponent>

<style lang="scss">
	.navbar {
		@apply text-slate-500;
		box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;

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
</style>
