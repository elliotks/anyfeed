<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'

	interface Link {
		name: string
		href?: string
	}

	export let links: Link[] = []
	export let current: string = ''
	export let navigate: () => void = () => {}

	async function go(link: Link) {
		if (link.href === $page.url.pathname || link.name === current) return

		await navigate()
		if (link.href) goto(link.href)
		else current = link.name
	}
</script>

<div>
	<nav flex gap-6>
		{#each links as link}
			<a
				on:click={() => go(link)}
				flex="~ shrink-0 items-center"
				rounded-lg
				p-2
				text="sm slate-500 md:hover:slate-700"
				font-medium
				cursor-pointer
				select-none
				class:bg-slate-100={link.href === $page.url.pathname || link.name === current}
				class:text-slate-700={link.href === $page.url.pathname || link.name === current}
			>
				{#if link.name === 'Starred'}<i i="iconamoon-star" mr-2 />{/if}{link.name}
			</a>
		{/each}
	</nav>
</div>
