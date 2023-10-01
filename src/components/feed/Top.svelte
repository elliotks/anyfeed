<script lang="ts">
	import SourceAvatar from '$components/SourceAvatar.svelte'
	import { innerWidth } from '$lib/window'
	import type { SourceDataWithId } from '$lib/db'
	import { getHost } from '$lib/utils'

	export let childPage: string = ''
	export let open: () => void = () => {}
	export let close: () => void = () => {}
	export let source: SourceDataWithId | null = null
</script>

{#if source && $innerWidth > 768}
	<div mx-auto max-w-lg px-4 class={$$props.class ?? ''}>
		<div flex items-center p-2 bg-white class="shadow-border" style="border-radius: 0 0 8px 8px">
			<a flex-shrink-0 href={source.url} target="_blank">
				<SourceAvatar
					data={{ ...source.avatar, url: source.url }}
					min={true}
					shadow={false}
					hover={false}
				/>
			</a>
			<a
				href={source.url}
				target="_blank"
				text-slate-500
				whitespace-nowrap
				overflow-hidden
				text-ellipsis
				ml-4
			>
				{source.name.length ? source.name : getHost(source.url)}
			</a>
		</div>
	</div>
{/if}

{#if source && $innerWidth <= 768}
	<div mx-auto max-w-512px px-4>
		<div
			mx-auto
			h-13
			flex
			items-center
			px-2
			bg-white
			class="shadow-border"
			style="border-radius: 8px;"
		>
			<div flex="~ grow items-center" overflow-hidden w="[100%-26px]">
				<a flex-shrink-0 href={source.url} target="_blank">
					<SourceAvatar data={{ ...source.avatar, url: source.url }} min={true} shadow={false} />
				</a>
				<a
					href={source.url}
					target="_blank"
					text-slate-500
					whitespace-nowrap
					overflow-hidden
					text-ellipsis
					ml-4
				>
					{source.name.length ? source.name : getHost(source.url)}
				</a>
			</div>
			{#if childPage === 'edit'}
				<span flex-shrink-0 on:click={close}>
					<i text-24px i={'tabler-arrow-back'} />
				</span>
			{:else}
				<span flex-shrink-0 on:click={open}>
					<i text-24px i={'fluent-edit-16-filled'} />
				</span>
			{/if}
		</div>
	</div>
{/if}
