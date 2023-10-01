<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	export let text: string = ''

	const dispatch = createEventDispatcher()
</script>

<div flex="~ items-center justify-center gap-4" bg-slate-400 px-4 py-3 text-white>
	<div whitespace-nowrap overflow-hidden text="ellipsis sm" font-medium>{text}</div>

	<button
		shrink-0
		rounded-lg
		bg="black/10 hover:black/20"
		p-1
		transition
		on:click|stopPropagation={() => dispatch('close')}
	>
		<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
			<path
				fill-rule="evenodd"
				d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
				clip-rule="evenodd"
			/>
		</svg>
	</button>
</div>
