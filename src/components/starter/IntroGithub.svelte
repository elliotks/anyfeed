<script lang="ts">
	import Button from '$components/common/Button.svelte'
</script>

<div mt-6 gap-4 flex class="start-ct">
	<div p-4 bg-white rounded-md display="none md:flex" flex="shrink-0 items-center">
		<i i="bi-github" w="32px md:64px" h="32px md:64px" />
	</div>
	<div p-4 bg-white rounded-md flex="~ grow items-center">
		<p>
			You can follow anything on a <b>public</b> repository, including <a
				href="/add/feed?url=https://github.com/sveltejs/svelte/releases"
				>releases <i i="fluent-open-12-regular" /></a
			>,
			<a href="/add/feed?url=https://github.com/mrdoob/three.js/commits/dev"
				>commits <i i="fluent-open-12-regular" /></a
			>,
			<a href="/add/feed?url=https://github.com/ggerganov/llama.cpp/pulls"
				>pull requests <i i="fluent-open-12-regular" /></a
			>,
			<a href="/add/feed?url=https://github.com/oven-sh/bun/issues"
				>issues <i i="fluent-open-12-regular" /></a
			>
			or
			<a href="/add/feed?url=https://github.com/pocketbase/pocketbase/discussions"
				>discussions <i i="fluent-open-12-regular" /></a
			>. &lt= Click on the links to see it in action.
		</p>
	</div>
</div>

<div mt-6 gap-4 flex>
	<h2 font-medium>Resources and content</h2>
</div>

<div mt-6 gap-4 class="resources">
	<a
		href="/add/feed?url=https://www.youtube.com/@GitHub"
		p-4
		bg="slate-100 md:hover:slate-200"
		rounded-md
		cursor-pointer
		relative
	>
		<i i="fluent-open-12-regular" w-5 h-5 absolute right-3 top-3 />
		<div flex="~ col justify-end items-center" text-center w-full h-34px>
			<i i="logos-youtube" w-140px h-24px />
		</div>
		<div w-full mt-4>Get the latest YouTube video published by GitHub directely in your feeds</div>
	</a>
	<a
		href="/add/feed?url=https://github.blog"
		p-4
		bg="slate-100 md:hover:slate-200"
		rounded-md
		cursor-pointer
		relative
	>
		<i i="fluent-open-12-regular" w-5 h-5 absolute right-3 top-3 />
		<div text="center 24px" font-medium h-34px>Blog</div>
		<div w-full mt-4>
			Updates, ideas, and inspiration from GitHub to help developers build and design software
		</div>
	</a>
	<a
		href="/add/feed?url=https://resources.github.com/articles/"
		p-4
		bg="slate-100 md:hover:slate-200"
		rounded-md
		cursor-pointer
		relative
	>
		<i i="fluent-open-12-regular" w-5 h-5 absolute right-3 top-3 />
		<div text="center 24px" font-medium h-34px>Resources</div>
		<div w-full mt-4>From setup to optimization, learn how to use GitHub to get the job done</div>
	</a>
</div>

<div mt-6 gap-4 flex>
	<h2 font-medium>Trends</h2>
</div>

<div mt-4>
	See what the GitHub community is most excited about. Suscribe to the trends below to get the
	latest updates in your feeds:
</div>

<div flex="~ wrap gap-2" mt-6>
	{#each ['JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'C++', 'C#', 'PHP', 'R', 'Swift', 'Ruby', 'Rust', 'Kotlin', 'Objective-C', 'Dart', 'Jupyter-Notebook', 'HTML', 'Zig', 'Shell', 'Dockerfile', 'Any'] as lang}
		<Button
			href={`/add/feed?url=https://github.com/trending/${lang.replace('#', 'sharp')}?since=weekly`}
			micro={true}
			class="capitalize"
		>
			{lang}
		</Button>
	{/each}
</div>

<style lang="scss">
	.start-ct {
		a {
			text-decoration: underline;
			text-decoration-style: dashed;
			font-weight: 500;
		}
	}

	.resources {
		display: flex;
		flex-direction: column;
    user-select: none;
		@media (min-width: 1280px) {
			display: grid;
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}
</style>
