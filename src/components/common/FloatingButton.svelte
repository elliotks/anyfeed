<script lang="ts">
	export let active: boolean | undefined = undefined
</script>

<span
	flex="~ items-center justify-center"
	z-99
	text-24px
	w-48px
	h-48px
	cursor-pointer
	rounded-xl
	bg-white
	shadow-xl
	class:active
	class="button {$$props.class ?? ''}"
>
	<slot />
</span>

<style lang="scss">
	.button {
		&.active {
			box-shadow: rgba(0, 0, 0, 0.07) 0px 1px 1px, rgba(0, 0, 0, 0.07) 0px 2px 2px,
				rgba(0, 0, 0, 0.07) 0px 4px 4px, rgba(0, 0, 0, 0.07) 0px 8px 8px,
				rgba(0, 0, 0, 0.07) 0px 16px 16px;
		}
		&:hover {
			@media screen and (min-width: 768px) {
				box-shadow: rgba(0, 0, 0, 0.07) 0px 1px 1px, rgba(0, 0, 0, 0.07) 0px 2px 2px,
					rgba(0, 0, 0, 0.07) 0px 4px 4px, rgba(0, 0, 0, 0.07) 0px 8px 8px,
					rgba(0, 0, 0, 0.07) 0px 16px 16px;
			}
		}
	}
</style>
