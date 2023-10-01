<script lang="ts">
	import { nanoid } from 'nanoid'

	export let value: boolean = false
	export let callback: ((value: boolean) => void) | null = null

	const id = nanoid()

	async function execCallback() {
		await new Promise((resolve) => setTimeout(resolve, 1))
		if (callback) callback(value)
	}
</script>

<label for={id} relative h-8 w-14 cursor-pointer>
	<input type="checkbox" {id} class="peer sr-only" bind:checked={value} on:click={execCallback} />

	<span absolute inset-0 rounded-full bg-gray-300 transition peer-checked-bg-slate-500 />

	<span
		absolute
		inset-y-0
		start-0
		m-1
		h-6
		w-6
		rounded-full
		bg-white
		transition-all
		peer-checked-start-6
	/>
</label>
