<script lang="ts">
	import { innerWidth } from '$lib/window'

	const advices: { desktop: string; mobile?: string }[] = [
		{
			desktop: `You can use your keyboard to navigate through the app. Press <b>shift</b> + <b>left</b> or <b>right</b> to switch between feeds, and <b>shift</b> + <b>up</b> or <b>down</b> to switch between posts. While holding <b>shift</b>, you can press <b>up</b> for 1 second to go back to the top, and do the same for <b>left</b> and <b>right</b> to reach the home or the "add feed" page.`,

			mobile: `You can swipe to the left or to the right to navigate through the app.`
		},
		{
			desktop: `Any feed can be updated manually, just click the <b>refresh icon</b> on the top right of the feed.`,

			mobile: `Any feed can be updated manually, just swipe from the very top of the feed to the bottom to refresh it.`
		},
		{
			desktop: `You can reorder your feeds by dragging and dropping their icon. Only the active one can be dragged to avoid accidental reordering.`,

			mobile: `You can reorder your feeds by dragging and dropping their icon. Only the active one can be dragged to avoid accidental reordering. If you have more icons than what can fit on the screen, swipe from the bottom to the top to open the reorder view.`
		},
		{
			desktop: `To star a post, click on its <b>three dots menu</b> and then on the <b>star icon</b>. You can then access your starred posts from the <b>starred tab</b> at the top of your feeds.`
		},
		{
			desktop: `To exclude a feed from showing up in the home, click the edit button (<b>pencil icon</b> at the top), and then unselect <b>display on home</b>.`
		}
	]

	const randomAdvice = advices[Math.floor(Math.random() * advices.length)]
</script>

<div mb="4 md:6" p-2 text-13px text-slate-400 class="center-1280">
	{#if randomAdvice.mobile && $innerWidth < 768}
		<div><i i="charm-info" w-16px h-16px mb-1 /> {@html randomAdvice.mobile}</div>
	{:else}
		<div><i i="charm-info" w-18px h-18px mb-1 /> {@html randomAdvice.desktop}</div>
	{/if}
</div>

<style lang="scss">
	b {
		font-weight: 500;
	}

	.center-1280 {
		@media (min-width: 1280px) {
			text-align: center;
		}
	}
</style>
