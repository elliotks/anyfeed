<script lang="ts">
	import { fade } from 'svelte/transition'
	import Input from '$components/common/Input.svelte'
	import Select, { generateHours } from '$components/common/Select.svelte'
	import type { Frequency } from '$lib/cron/utils'

	export let frequency: Frequency = 'once'
	export let frequencyAt: number = 6
	export let frequencyAnd: number = 6
	export let customFrequency: string = ''
	export let customFrequencyError: string = ''

	const hoursOptions = generateHours()
	let focusCustomFrequency = false
</script>

<div flex="~ wrap items-center gap-x-4" on:click={() => (focusCustomFrequency = true)}>
	<Select
		class="mt-4"
		options={[
			{ value: 'once', title: 'Once a day' },
			{ value: 'twice', title: 'Twice a day' },
			{ value: 'six', title: 'Every 6 hours' },
			{
				value: 'custom',
				title: 'Custom',
				subtitle: `If you prefer a specific frequency, you can define it with a cron schedule expression`
			},
			{
				value: 'none',
				title: 'Manually',
				subtitle: `The feed will only update when you press the refresh button`
			}
		]}
		bind:selected={frequency}
	/>
	{#if ['once', 'twice', 'six'].includes(frequency)}
		<span mt-4>{frequency === 'six' ? 'start ' : ''}at</span>
		{#if frequency === 'twice'}
			<span flex-basis="100% md:0" />
		{/if}
		<Select class="mt-4" options={hoursOptions} bind:selected={frequencyAt} />
	{/if}
	{#if frequency === 'twice'}
		<span mt-4>and</span>
		<Select class="mt-4" options={hoursOptions} bind:selected={frequencyAnd} />
	{/if}
	{#if frequency === 'custom'}
		<Input
			class="mt-4 flex-grow"
			placeholder="Cron schedule expression"
			focusOnMount={focusCustomFrequency}
			bind:error={customFrequencyError}
			hideError={true}
			bind:value={customFrequency}
		/>
	{/if}
	{#if frequency === 'custom' && customFrequencyError}
		<div transition:fade text-sm mt-2 ml-2 text-red font-medium>{@html customFrequencyError}</div>
	{/if}
</div>
