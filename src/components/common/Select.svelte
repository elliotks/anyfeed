<script context="module" lang="ts">
	export function generateHours(): { value: number; title: string }[] {
		const hours = []
		for (let i = 6; i <= 24; i++) {
			const hour = i === 24 ? 0 : i
			const title = `${hour.toString().padStart(2, '0')}:00`
			hours.push({ value: hour, title })
		}
		for (let i = 1; i < 6; i++) {
			const title = `${i.toString().padStart(2, '0')}:00`
			hours.push({ value: i, title })
		}
		return hours
	}
</script>

<script lang="ts">
	import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte'
	import { nanoid } from 'nanoid'
	import { fade } from 'svelte/transition'
	import { click, innerWidth } from '$lib/window'

	export let options: { value: string | number; title: string; subtitle?: string }[] = []
	export let selected: string | number | undefined = undefined
	export let width: number | undefined = undefined
	export let openTop = false

	let open = false
	let span: HTMLSpanElement

	const id = nanoid()

	function handleClick(e: MouseEvent) {
		if ((e.target as HTMLElement).closest(`.select-${id} .head`)) return
		open = false
	}

	// TODO: scroll into view when needed

	$: selectedOption = options.find((option) => option.value === selected) ?? options[0]
	$: if ($click) handleClick($click)
</script>

{#if options.length}
	<span inline-block md-relative class={`select-${id} ${$$props.class ?? ''}`}>
		<span
			flex="inline items-center justify-between"
			rounded-lg
			border-slate-200
			px-4
			h-13
			text-sm
			shadow-sm
			outline-slate-500
			bg-white
			cursor-pointer
			select-none
			class="head"
			style={width ? `min-width: ${width}px` : undefined}
			on:click={() => (open = !open)}
			bind:this={span}
		>
			{selectedOption?.title}
			<span ml-3>
				<i transition-100 class={open && '-rotate-180'} i="fa-caret-down" />
			</span>
		</span>
		{#if open}
			<span class="mask" z-10>
				<ul
					block
					md="absolute right-0 min-w-full"
					shadow
					bg-white
					rounded-lg
					text-sm
					z-10
					class:md-w-70={options.find((o) => o.subtitle)}
					class:md-top-15={!openTop}
					class:md-bottom-15={openTop}
					class="popover"
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
								block
								hover-bg-slate-100
								cursor-pointer
								not-last-border-b
								on:click={() => (selected = option.value)}
							>
								<span flex="~ items-center justify-between" px-4 py-3 w-full text-nowrap>
									{option.title}
									{#if selectedOption.value === option.value}
										<i i="mingcute-check-fill" ml-4 />
									{/if}
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
	</span>
{/if}

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
