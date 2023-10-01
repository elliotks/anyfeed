<script lang="ts">
	import { fade, fly } from 'svelte/transition'
	import Input from '$components/common/Input.svelte'
	import Button from '$components/common/Button.svelte'
	import Toggle from '$components/common/Toggle.svelte'
	import trapFocus from '$lib/trapFocus'
	import Modal from '$components/common/Modal.svelte'
	import Info from '$components/common/Info.svelte'
	import FollowKeyword from '$components/starter/FollowKeyword.svelte'

	export let form: boolean
	export let manualXpath: boolean
	export let manualXpathError: string
	export let showPreview: (e?: CustomEvent<KeyboardEvent>) => void
	export let url: string
	export let urlError: string
	export let xpath: string
	export let xpathHelp: boolean
	export let xpathInput: Input
</script>

<div transition:fly={{ y: -100, duration: 200 }} class="enter-url" mx-auto max-w-lg px-4 py-6>
	<div mx-auto text-center>
		<h1 text-2xl>Add a new feed</h1>
		<Info class="mt-6">
			Please enter the URL of a page such as a blog listing, Anyfeed will search for an RSS feed. If
			not found, it will attempt to recognize recurring patterns and retrieve fresh content.
		</Info>
	</div>

	{#key form}
		<form use:trapFocus={!form} mx-auto mb-0 mt-8>
			<Input
				placeholder="URL"
				bind:value={url}
				bind:error={urlError}
				on:keyup={(e) => showPreview(e)}
				showEnterIcon={true}
			/>
			<div text="slate-400 sm" mt-4 px-2>
				If it is still unable to locate the desired content, you can provide an XPath.
			</div>
			<div flex="~ gap-4 items-center" mt-4 h-13>
				<Toggle bind:value={manualXpath} />
				{#if manualXpath}
					<Input
						class="flex-grow"
						placeholder="XPath/selector of a recurring element"
						bind:value={xpath}
						hideError={true}
						bind:error={manualXpathError}
						bind:this={xpathInput}
					/>
				{:else}
					<span text="slate-400 14px">XPath</span>
					<div flex="~ grow md:justify-end">
						<Button class="flex-grow md:flex-grow-0" on:click={() => showPreview()}>
							<i i={'octicon-search-16'} mr-4 />Search
						</Button>
					</div>
				{/if}
			</div>
			{#if manualXpath && manualXpathError}
				<div text-sm pl-72px mt-1 ml-2 text-red font-medium>
					{manualXpathError}
				</div>
			{/if}
			{#if manualXpath}
				<div text-right pr-1>
					<span
						on:click={() => (xpathHelp = true)}
						text="sm slate-400"
						cursor-pointer
						underline="~ dashed"
					>
						How to retrieve the XPath
					</span>
				</div>
				<div flex justify-end w-full md-pl-72px mt-4>
					<Button class="flex-grow md:flex-grow-0" on:click={() => showPreview()}>
						<i i={'octicon-search-16'} mr-4 />Search
					</Button>
				</div>
				<Modal bind:open={xpathHelp}>
					<div p-6>
						XPath is a query language used to locate and select specific elements in an XML or HTML
						document using path expressions based on the hierarchical structure of the data.<br
						/><br />

						Anyfeed uses XPath to retrieve the content of a web page. When manually specifying an
						XPath expression, you need to select the path corresponding to the root of one of the
						recurring elements you want Anyfeed to fetch.<br /><br />

						From your browser, you can find the XPath expression of an element by following these
						steps:<br /><br />

						<ol pl-4 font-medium style="list-style-type: decimal">
							<li mb-2>
								Inspect the element by right-clicking on it and selecting "Inspect" using the
								browser's developer tools.
							</li>
							<li mb-2>
								In the developer tools panel, locate the HTML element you are interested in.
							</li>
							<li>
								Right-click on the element in the HTML panel and choose "Copy" &gt; "Copy Full
								XPath" to copy the XPath expression associated with that element.
							</li>
						</ol>

						<div mt-4>
							The retrieved XPath should resemble something like this (it needs to start with
							/html):
							<code block mt-2>/html/body/div[1]/div[2]/ul/li[3]/a[1]</code>
						</div>

						<div mt-4>
							To handle complex page structures, you can combine multiple XPaths by separating them
							with a comma:
							<code block mt-2>
								/html/body/div[1]/div[2]/ul/li[3]/a[1],/html/body/div[2]/main/section[3]/aside/div[2]/div[2]/div[2]/div[1]
							</code>
						</div>
					</div>
				</Modal>
			{/if}
		</form>
	{/key}

	{#if url && !url.match(/^https?:\/\//i)}
		<div mt-8 transition:fade>
			<FollowKeyword
				keyword={url.trim()}
				wide={false}
				callback={(url) => {
					document.location.href = `/add/feed?url=${url}`
				}}
			/>
		</div>
	{/if}
</div>
