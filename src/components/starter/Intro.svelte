<script lang="ts">
	import Tabs from '$components/common/Tabs.svelte'
	import { sources } from '$lib/store'
	import IntroGithub from '$components/starter/IntroGithub.svelte'
	import IntroKeywords from '$components/starter/IntroKeywords.svelte'
	import IntroPlatforms from '$components/starter/IntroPlatforms.svelte'
	import { fade } from 'svelte/transition'
	import { intro } from '$lib/store'
</script>

<div mb="4 md:6">
	{#if $sources.length < 4}
		<div mb-6 p-2 rounded-md bg-white class="feedback">
			Thank you for trying out Anyfeed! Your <a href="https://github.com/edbrdi/anyfeed"
				>feedback <i i="fluent-open-12-regular" /></a
			> would be greatly appreciated ♥ Here are some content suggestions and instructions to help you
			get started.
		</div>
	{/if}
	<Tabs
		tabs={[
			{
				name: 'GitHub',
				value: 'github'
			},
			{
				name: 'Keywords',
				value: 'keywords'
			},
			{
				name: 'Platforms',
				value: 'platforms'
			}
		]}
		bind:current={$intro.current}
	/>

	{#if $intro.current === 'github'}
		<div transition:fade={{ duration: 200 }}>
			<IntroGithub />
		</div>
	{:else if $intro.current === 'keywords'}
		<div transition:fade={{ duration: 200 }}>
			<IntroKeywords />
		</div>
	{:else if $intro.current === 'platforms'}
		<div transition:fade={{ duration: 200 }}>
			<IntroPlatforms />
		</div>
	{/if}
</div>

<style lang="scss">
	.feedback {
		a {
			text-decoration: underline;
			text-decoration-style: dashed;
			font-weight: 500;
		}
	}
</style>
