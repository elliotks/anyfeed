<script lang="ts">
	import { getFirstCharHost, getOneOrTwoChar } from '$lib/utils'
	import Avatar from './common/Avatar.svelte'
	import type { AvatarData } from './common/avatar.types'
	interface Data extends AvatarData {
		url: string
		name?: string
	}

	export let data: Data
	export let min = false
	export let micro = false
	export let disabled = false
	export let hover = true
	export let shadow = true
</script>

<div
	relative
	class={`${micro ? 'w-5 h-5' : 'w-9 h-9'} ${!(min || micro) ? 'md-w-11 md-h-11' : ''}`}
>
	{#if disabled}
		<div absolute w-full h-full bg-white z-1 opacity-50 />
	{/if}
	{#if data.type !== 'text'}
		<Avatar
			logo={data.logo || '/default_avatar.png'}
			background={data.background}
			{disabled}
			{hover}
			{shadow}
			{min}
		/>
	{/if}
	{#if data.type !== 'logo'}
		<Avatar
			text={data.text || (data.name && getOneOrTwoChar(data.name)) || getFirstCharHost(data.url)}
			background={data.background}
			{disabled}
			hover={data.type === 'both' ? false : hover}
			{shadow}
			{min}
			color={data.color}
			micro={data.type === 'both' || micro}
			class={data.type === 'both' && 'absolute right-0 bottom-0'}
		/>
	{/if}
</div>
