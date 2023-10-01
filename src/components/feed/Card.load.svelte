<script lang="ts">
	export let expandable: boolean = false
	export let noAvatar = false
	export let noDate = false
</script>

<div flex="~ wrap" class="skeleton">
	<div flex="~ items-center justify-between" w-full mb-2>
		<div flex items-center>
			{#if !noAvatar}
				<div
					flex="~ items-center justify-center"
					text-xl
					font-bold
					w-12
					h-12
					object-cover
					rounded-lg
					bg-slate-300
				/>
				<span ml-4 w-100px h-5 rounded-md bg-slate-300 />
			{/if}
		</div>
		{#if !noDate}<span w-100px h-5 rounded-md bg-slate-300 />{/if}
	</div>

	<div h="43 md:50" w-full max-w-lg rounded-lg bg-slate-300 class:card-img={expandable} />

	<div block p-4 class:card-txt={expandable}>
		<div w-full h-8 mt-2 rounded-md bg-slate-300 />

		<div w-full h-5 mt-4 rounded-md bg-slate-300 />
		<div w="1/2" h-5 mt-2 rounded-md bg-slate-300 />
	</div>
</div>

<style lang="scss">
	@keyframes fade {
		0% {
			opacity: 1;
		}
		50% {
			opacity: 0.65;
		}
		100% {
			opacity: 1;
		}
	}

	.skeleton {
		animation: fade 2s infinite;
	}

	.card-txt {
		width: 100%;

		@media (min-width: 1280px) {
			width: 50%;
			padding-left: 32px;
			display: flex;
			flex-direction: column;
			justify-content: center;
		}
	}
</style>
