<script lang="ts">
	import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte'
	import { nanoid } from 'nanoid'
	import { fade } from 'svelte/transition'
	import { click, innerWidth } from '$lib/window'

	export let options: {
		callback: () => void | number
		title: string
		subtitle?: string
		icon?: string
	}[] = []

	export let open = false

	const id = nanoid()

	function handleClick(e: MouseEvent) {
		if ((e.target as HTMLElement).closest(`.menu-${id} ul`)) return
		open = false
	}

	$: if ($click) handleClick($click)
</script>

<span class="menu-{id} {$$props.class ?? ''}">
	<span on:click|stopPropagation={() => (open = true)}>
		<slot />
	</span>
	<div absolute>
		{#if open}
			<span class="mask" z-10 on:click={handleClick}>
				<ul
					block
					md-absolute
					min-w-100px
					shadow
					bg-white
					rounded-lg
					overflow-hidden
					text-sm
					z-10
					class:md-w-70={options.find((o) => o.subtitle)}
					class="popover {$$props.popoverClass ?? ''}"
					transition:fade={{ duration: 100 }}
				>
					<OverlayScrollbarsComponent
						options={{
							scrollbars: {
								visibility: 'auto',
								autoHide: $innerWidth < 768 ? 'never' : 'move',
								autoHideDelay: 400
							},
							overflow: {
								x: 'hidden'
							}
						}}
						class="max-h-75dvh md:max-h-250px"
					>
						{#each options as option}
							<li
								md-hover-bg-slate-100
								block
								cursor-pointer
								not-last-border-b
								on:click={option.callback}
							>
								<span flex="~ items-center" px-4 py-3 w-full text-nowrap>
									<!-- uno safelist doesn't work, can't have dynamic icon -->
									{#if option.icon === 'star'}
										<i i="iconamoon-star" mr-2 />
									{/if}
									{#if option.icon === 'starred'}
										<i i="iconamoon-star-fill" mr-2 />
									{/if}
									{#if option.icon === 'delete'}
										<i i="ion-trash-outline" mr-2 />
									{/if}
									{option.title}
								</span>
								{#if option.subtitle}
									<span block px-4 pb-3 pt-0 w-full text-slate-400>
										{option.subtitle}
									</span>
								{/if}
							</li>
						{/each}
					</OverlayScrollbarsComponent>
				</ul>
			</span>
		{/if}
	</div>
</span>

<style lang="scss">
	.mask {
		@media screen and (max-width: 768px) {
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
	}

	.popover {
		@media screen and (max-width: 768px) {
			position: relative;
			max-width: 80dvw;
			box-shadow: rgba(17, 17, 26, 0.1) 0px 0px 16px;
		}
	}
</style>
