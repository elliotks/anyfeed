<script lang="ts">
	import { fly } from 'svelte/transition'
	import FloatingButton from '$components/common/FloatingButton.svelte'
	import { scrollTop, showScrollToTop } from '$routes/+layout.svelte'
</script>

{#if $showScrollToTop}
	<div fixed bottom="18 md:6" right="4 md:6" transition:fly={{ y: 30 }}>
		<span cursor-pointer on:click={() => scrollTop(true)}>
			<FloatingButton>
				<i i={'tabler-arrow-up'} />
			</FloatingButton>
		</span>
	</div>
{/if}
