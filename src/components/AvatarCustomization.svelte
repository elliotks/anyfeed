<script lang="ts">
	import ColorPicker from 'svelte-awesome-color-picker'
	import Input from '$components/common/Input.svelte'
	import { getFirstCharHost, getOneOrTwoChar } from '$lib/utils'
	import Avatar from '$components/common/Avatar.svelte'
	import type { AvatarData } from './common/avatar.types'

	export let avatar: AvatarData
	export let name: string
	export let url: string
	export let logoPreview: string = ''
</script>

<div flex mt-6 gap-5 class="avatar">
	<span on:click={() => (avatar.type = 'logo')}>
		<i i="fa-caret-down" class="avatar-select" class:active={avatar.type === 'logo'} />
		<Avatar
			logo={avatar.logo || logoPreview || '/default_avatar.png'}
			background={avatar.background}
		/>
	</span>
	<span on:click={() => (avatar.type = 'text')}>
		<i i="fa-caret-down" class="avatar-select" class:active={avatar.type === 'text'} />
		<Avatar
			text={avatar.text ||
				(/^(?=.*[a-zA-Z0-9])[a-zA-Z0-9\s-]+$/.test(name) && getOneOrTwoChar(name)) ||
				getFirstCharHost(url)}
			background={avatar.background}
			color={avatar.color}
		/>
	</span>
	<span relative on:click={() => (avatar.type = 'both')}>
		<i i="fa-caret-down" class="avatar-select" class:active={avatar.type === 'both'} />
		<Avatar
			logo={avatar.logo || logoPreview || '/default_avatar.png'}
			background={avatar.background}
		/>
		<Avatar
			text={avatar.text || (/^(?=.*[a-zA-Z0-9])[a-zA-Z0-9\s-]+$/.test(name) && getOneOrTwoChar(name)) || getFirstCharHost(url)}
			background={avatar.background}
			color={avatar.color}
			micro={true}
			class="absolute right-0 bottom-0"
		/>
	</span>
</div>

{#if avatar.type !== 'text'}
	<Input class="mt-6 flex-grow" placeholder={logoPreview || 'Logo URL'} bind:value={avatar.logo} />
{/if}

{#if avatar.type !== 'logo'}
	<Input
		class="mt-6 flex-grow"
		placeholder={(/^(?=.*[a-zA-Z0-9])[a-zA-Z0-9\s-]+$/.test(name) && getOneOrTwoChar(name)) || getFirstCharHost(url)}
		bind:value={avatar.text}
	/>
{/if}

<div flex flex-wrap>
	<div mt-6 w="full md:50%">
		<ColorPicker bind:hex={avatar.background} label="Background color" />
	</div>
	{#if avatar.type !== 'logo'}
		<div mt-6 w="full md:50%">
			<ColorPicker bind:hex={avatar.color} label="Text color" />
		</div>
	{/if}
</div>

<style lang="scss">
	.avatar {
		span {
			@apply relative text-lg text-slate-700 cursor-pointer;
		}

		.avatar-select {
			@apply absolute hidden;
			top: -18px;
			left: calc(50% - 9px);

			&.active {
				@apply block;
			}
		}
	}

	// Fix color picker width (bug appears on build)
	:global(.color-picker > label > div) {
		width: 50px !important;
	}
</style>
