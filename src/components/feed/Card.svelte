<script lang="ts">
	import { getHost } from '$lib/utils'
	import type { AvatarData } from '$components/common/avatar.types'
	import SourceAvatar from '$components/SourceAvatar.svelte'
	import Menu from '$components/common/Menu.svelte'
	import dayjs from 'dayjs'
	import relativeTime from 'dayjs/plugin/relativeTime'
	import { page } from '$app/stores'
	import { feedVisibility, removeFromFeed, feedState, sources, feed } from '$lib/store'
	import Modal from '$components/common/Modal.svelte'
	import Button from '$components/common/Button.svelte'

	dayjs.extend(relativeTime)

	type Data = {
		id?: number
		sourceId?: number
		sourceUrl: string
		background?: string
		createdAt?: string
		description: string | null
		image: string | null
		title: string | null
		url: string
		name: string
		avatar?: AvatarData
		bookmark: boolean
	}

	export let data: Data
	export let hover: boolean = true
	export let menu: boolean = true
	export let expandable: boolean = false

	let showDelete = false
	let showMenu = false
</script>

<div flex="~ wrap" transition rounded-lg class:hover class={`card ${$$props.class ?? ''}`}>
	<div flex items-center w-full mb-2 ml-1px>
		{#if $page.url.pathname !== `/feed/${data.sourceId}`}
			<a flex-shrink-0 href={data.sourceId ? `/feed/${data.sourceId}` : data.sourceUrl}>
				{#if data.avatar}
					<SourceAvatar data={{ ...data.avatar, url: data.url, name: data.name }} />
				{/if}
			</a>
		{/if}
		<div ml-4 class:mr-2={!menu} flex="~ grow items-center justify-between gap-4" overflow-hidden>
			{#if $page.url.pathname !== `/feed/${data.sourceId}`}
				<a
					href={data.sourceUrl}
					target="_blank"
					text="slate-500 md:hover:slate-700 ellipsis"
					whitespace-nowrap
					overflow-hidden
				>
					{data.name.length ? data.name : getHost(data.url)}
				</a>
			{/if}
			{#if data.createdAt}
				<span text="slate-500 sm right" pl-2 flex="~ grow items-center justify-end shrink-0">
					<i i="mingcute-time-line" mr-2 />
					{dayjs(data.createdAt).fromNow()}
				</span>
			{/if}
			{#if menu}
				<Menu
					bind:open={showMenu}
					options={[
						{
							icon: data.bookmark ? 'starred' : 'star',
							title: data.bookmark ? 'Starred' : 'Star',

							callback: () => {
								data.bookmark = !data.bookmark
								const sourceId = `${$page.url.pathname === '/' ? '0' : data.sourceId}`

								if ($feedState[sourceId].filter === 'Starred') {
									$feed[sourceId] = $feed[sourceId].filter((f) => f.id !== data.id)
								}

								fetch(`/api/feed`, {
									method: 'PUT',
									body: JSON.stringify({ feedData: data }),
									headers: {
										'Content-Type': 'application/json'
									}
								})
							}
						},
						{
							icon: 'delete',
							title: 'Delete',

							callback: () => {
								showMenu = false
								showDelete = true
							}
						}
					]}
					popoverClass="md-top-1 -md-right-[20px]"
				>
					<i
						i="pepicons-pop-dots-y"
						text="slate-400 md:hover:slate-800 20px"
						text-20px
						cursor-pointer
					/>
				</Menu>
			{/if}
		</div>
	</div>

	{#if data.image}
		<a w-full max-w-lg class:card-img={expandable} href={data.url} target="_blank">
			<div
				h="46 md:56"
				w-full
				shadow-xl
				style={`background-color: ${data.background || '#f1f5f9'}; ${
					!data.image
						? 'background: linear-gradient(45deg, ' +
						  (data.background || '#f1f5f9') +
						  ', transparent);'
						: 'background-image: url(' + data.image + ');'
				} background-size: cover; background-position: center; border-radius: 8px 8px 0 0`}
			/>
		</a>
	{/if}

	<a
		href={data.url}
		target="_blank"
		block
		p-4
		class:card-txt={expandable}
		class:no-img={!data.image}
	>
		{#if data.title}
			<h3 text="lg slate-800" line-clamp-3 font-medium>
				{data.title}
			</h3>
		{/if}

		{#if data.description}
			<p
				mt-2
				text="sm/relaxed slate-500"
				class:line-clamp-3={data.image}
				class:line-clamp-5={!data.image}
			>
				{data.description}
			</p>
		{/if}
	</a>
</div>

<Modal bind:open={showDelete}>
	<div p-6>
		<div text-16px font-medium max-w-500px>
			Do you really want to delete "{data.title ||
				(data.description && data.description.length > 30
					? data.description.substring(0, 30) + '...'
					: data.description)}"?
		</div>
		<div flex="~ wrap justify-center gap-4" w-full mt-6>
			<Button on:click={() => (showDelete = false)} nude small>No</Button>
			<Button
				callback={() => {
					removeFromFeed(data.id)
					showDelete = false

					setTimeout(() => {
						// reset feed visibility
						Object.keys($feedVisibility).forEach((key) => {
							$feedVisibility[key] = {}
						})

						// reset scroll position if we use the id somewhere
						if ($feedState['0'].scroll === data.id) $feedState['0'].scroll = 0
						$sources.forEach((source) => {
							if ($feedState[`${source.id}`].scroll === data.id) $feedState[source.id].scroll = 0
						})
					}, 500)
				}}
				red
				small>Yes</Button
			>
		</div>
	</div>
</Modal>

<style lang="scss">
	.card.hover:hover {
		@media screen and (min-width: 768px) {
			box-shadow: rgba(0, 0, 0, 0.2) 0px 50px 80px -30px;
		}
	}

	.card-img {
		> div {
			@media (min-width: 1280px) {
				border-radius: 8px 0 0 8px !important;
			}
		}
	}

	.card-txt {
		@media (min-width: 1280px) {
			width: 50%;
			padding-left: 32px;
			display: flex;
			flex-direction: column;
			justify-content: center;

			h3 {
				font-size: 28px;
				line-height: 32px;
			}
			p {
				font-size: 16px;
			}
		}

		&.no-img {
			@media (min-width: 1280px) {
				width: 100%;
				padding: 16px;
			}
		}
	}
</style>
