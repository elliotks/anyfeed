<script lang="ts">
	export let keyword = ''
	export let wide = true
	export let callback: (url: string) => void = () => {}
</script>

<div mt-6 gap-4 text-sm class:canBeWide={wide} class="resources">
	<a
		href={`/add/feed?url=${encodeURIComponent(
			`https://hnrss.org/newest?q=${keyword}&points=1&comments=1`
		)}`}
		p-4
		bg="slate-100 md:hover:slate-200"
		rounded-md
		cursor-pointer
		relative
		on:click={() =>
			callback(encodeURIComponent(`https://hnrss.org/newest?q=${keyword}&points=1&comments=1`))}
	>
		<i i="fluent-open-12-regular" w-5 h-5 absolute right-3 top-3 />
		<div flex="~ col justify-end items-center" text-center w-full>
			<i i="fa-hacker-news" w-42px h-42px color="#FF6600" />
		</div>
		<div w-full mt-4 text-center>
			Watch <span italic font-medium>"{keyword}"</span> on <span font-medium>Hacker News</span>
		</div>
	</a>
	<a
		href={`/add/feed?url=${encodeURIComponent(
			`https://www.reddit.com/search/?q=${keyword}&sort=relevance&t=week`
		)}`}
		p-4
		bg="slate-100 md:hover:slate-200"
		rounded-md
		cursor-pointer
		relative
		on:click={() =>
			callback(
				encodeURIComponent(`https://www.reddit.com/search/?q=${keyword}&sort=relevance&t=week`)
			)}
	>
		<i i="fluent-open-12-regular" w-5 h-5 absolute right-3 top-3 />
		<div flex="~ col justify-end items-center" text-center w-full>
			<i i="fa-reddit-square" w-42px h-42px color="#FF4500" />
		</div>
		<div w-full mt-4 text-center>
			Watch <span italic font-medium>"{keyword}"</span> on <span font-medium>Reddit</span>
		</div>
	</a>
	<a
		href={`/add/feed?url=https://dev.to/t/${keyword.replace(/\W/g, '')}/latest`}
		p-4
		bg="slate-100 md:hover:slate-200"
		rounded-md
		cursor-pointer
		relative
		on:click={() => callback(`https://dev.to/t/${keyword.replace(/\W/g, '')}/latest`)}
	>
		<i i="fluent-open-12-regular" w-5 h-5 absolute right-3 top-3 />
		<div flex="~ col justify-end items-center" text-center w-full>
			<span
				w-42px
				h-42px
				rounded-lg
				bg-black
				text-white
				flex="~ items-center justify-center"
				font-medium
				text-18px>DEV</span
			>
		</div>
		<div w-full mt-4 text-center>
			Watch <span italic font-medium>"{keyword}"</span> on <span font-medium>Dev.to</span>
		</div>
	</a>
</div>

<style lang="scss">
	.resources {
		display: flex;
		flex-direction: column;
		user-select: none;

		&.canBeWide {
			@media (min-width: 1280px) {
				display: grid;
				grid-template-columns: repeat(3, minmax(0, 1fr));
			}
		}
	}
</style>
