<script lang="ts">
	interface Tab {
		name: string
		value: string
	}

	export let tabs: Tab[] = []
	export let current = ''
	export let timeout = 200

	function setCurrent(tab: Tab) {
		current = ''
		setTimeout(() => {
			current = tab.value
		}, timeout)
	}
</script>

<div>
	<nav flex flex-wrap gap-x-6>
		{#each tabs as tab}
			<a
				on:click={() => setCurrent(tab)}
				flex="~ shrink-0 items-center"
				rounded-lg
				p-2
				text="sm slate-500 md:hover:slate-700"
				font-medium
				cursor-pointer
				select-none
				class:bg-slate-100={tab.value === current}
				class:text-slate-700={tab.value === current}
			>
				{tab.name}
			</a>
		{/each}
	</nav>
</div>
