<script lang="ts">
	export let title: string = ''
</script>

<div
	flex
	items-center
	rounded
	border="slate-500 s-4"
	bg-white
	px-4
	py-2
	class={$$props.class ?? ''}
>
	<i i="akar-icons-info-fill" text="xl slate-500" mr-4 hidden class="!md-block" />
	<div>
		{#if title}
			<strong mb-2 block font-medium text-slate-800>{title}</strong>
		{/if}
		<p text="sm left slate-700">
			<slot />
		</p>
	</div>
</div>
