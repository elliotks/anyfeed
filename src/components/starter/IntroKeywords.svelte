<script lang="ts">
	import Input from '$components/common/Input.svelte'
	import FollowKeyword from './FollowKeyword.svelte'
	import { fade } from 'svelte/transition'
	import { intro } from '$lib/store'
	import { onMount } from 'svelte'

	let keywordError = ''
	let visible = false

	function checkKeyword() {
		if ($intro.keyword) {
			const regex = /^[a-zA-Z0-9\s-]+$/
			if (!regex.test($intro.keyword)) {
				visible = false
				keywordError = 'A keyword can only contain alphanumeric characters, spaces, and hyphens.'
			} else {
				visible = true
				keywordError = ''
			}
		} else {
			visible = false
		}
	}

	onMount(() => {
		checkKeyword()
	})
</script>

<div mt-6 gap-4 flex class="start-ct">
	<div p-4 bg-white rounded-md display="none md:flex" flex="shrink-0 items-center">
		<i i="mingcute-search-line" w="32px md:64px" h="32px md:64px" />
	</div>
	<div p-4 bg-white rounded-md flex="~ grow items-center">
		<p>
			You can follow specific keywords on <span font-medium>Hacker News</span>,
			<span font-medium>Reddit</span>
			and <span font-medium>Dev.to</span>. Generic keywords are likely to generate a large number of
			results and noise in your feeds. Try to be as specific as possible. Dev.to is more restrictive
			so you may encounter a "No content found". You can use the form below or directly enter a
			keyword on the "<a href="/add/feed">Add Feed <i i="fluent-open-12-regular" /></a>" page, and
			then select the source from where you want to watch it.
		</p>
	</div>
</div>

{#if $intro.keyword && visible}
	<div transition:fade>
		<FollowKeyword keyword={$intro.keyword.trim()} />
	</div>
{/if}

<div mt-6 gap-4 flex>
	<Input
		placeholder="Keyword"
		bind:value={$intro.keyword}
		bind:error={keywordError}
		on:keyup={() => checkKeyword()}
		class="w-full"
	/>
</div>

<style lang="scss">
	.start-ct {
		a {
			text-decoration: underline;
			text-decoration-style: dashed;
			font-weight: 500;
		}
	}
</style>
