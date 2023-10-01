<script lang="ts">
	import { onMount } from 'svelte'

	export let logo = ''
	export let text = ''
	export let color = ''
	export let background = ''

	export let min = false
	export let micro = false
	export let disabled = false
	export let hover = true
	export let shadow = true

	let classes = ''

	function classBuilder() {
		let tempClasses =
			'avatar flex items-center justify-center font-bold p-2px transition object-cover select-none'
		if (!micro) tempClasses += ' w-9 h-9 rounded-lg text-22px'
		else tempClasses += ' rounded-3px'
		if (!(min || micro)) tempClasses += ' md-w-11 md-h-11'
		if ($$props.class) tempClasses += ` ${$$props.class}`

		if (text) {
			if (micro && min) tempClasses += ' w-4 h-4 text-10px'
			if (micro && !min) tempClasses += ' w-5 h-5 text-12px'
		} else {
			if (micro) tempClasses += ' w-5 h-5'
		}

		classes = tempClasses
	}

	onMount(() => {
		classBuilder()
	})
</script>

<div
	class:disabled
	class:shadow-xl={shadow}
	class:md-hover-shadow={hover}
	class={classes}
	style={`background-image: url(${logo}); background-position: center; background-size: cover;` +
		`background-color: ${background || '#FFF'};` +
		`color: ${color || '#64758B'};`}
>
	{text}
</div>

<style lang="scss">
	.disabled {
		filter: grayscale(0.5);
	}
</style>
