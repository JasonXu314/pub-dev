<script lang="ts">
	import { ActionIcon, Group, Stack, Text, UnstyledButton } from '@svelteuidev/core';
	import { Archive, FilePlus } from 'radix-icons-svelte';
	import { createEventDispatcher } from 'svelte';
	import FileElement from './FileElement.svelte';

	export let directory: Directory;
	export let prevPath: string;
	export let getModel: (name: string) => FileModel;
	export let setModel: (model: FileModel) => void;

	const dispatch = createEventDispatcher<{ 'create-file': string; 'create-dir': string }>();

	let open: boolean = true,
		hovering: boolean = false;
</script>

<Stack spacing={0} justify="start" override={{ maxHeight: open ? 'unset' : 24, overflow: 'hidden' }}>
	<UnstyledButton on:click={() => (open = !open)} on:mouseenter={() => (hovering = true)} on:mouseleave={() => (hovering = false)}>
		<Group
			override={{
				cursor: 'pointer',
				display: 'grid',
				gridTemplateColumns: '1fr auto',
				'&:hover': {
					background: '$dark500'
				}
			}}
		>
			<Group spacing={6} override={{ marginTop: 4, marginBottom: 4 }}>
				{#if open}
					<svg viewBox="0 0 24 24" class="icon">
						<path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
					</svg>
				{:else}
					<svg viewBox="0 0 24 24" class="icon">
						<path fill="currentColor" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
					</svg>
				{/if}
				<svg viewBox="0 0 24 24" class="icon">
					<path fill="currentColor" d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z" />
				</svg>
				<Text>
					{directory.name}
				</Text>
			</Group>
			<Group override={{ paddingRight: '$smPX' }} spacing={4}>
				{#if hovering}
					<ActionIcon
						variant="hover"
						size={20}
						override={{ color: '$gray300 !important', '&:hover': { backgroundColor: '$gray700 !important' } }}
						on:click!stopPropagation={() => dispatch('create-file', directory.name)}
					>
						<FilePlus />
					</ActionIcon>
					<ActionIcon
						variant="hover"
						size={20}
						override={{ color: '$gray300 !important', '&:hover': { backgroundColor: '$gray700 !important' } }}
						on:click!stopPropagation={() => dispatch('create-dir', directory.name)}
					>
						<Archive />
					</ActionIcon>
				{/if}
			</Group>
		</Group>
	</UnstyledButton>
	<Stack spacing={0} justify="start" override={{ paddingLeft: 24 }}>
		{#if directory.dirs.length > 0}
			{#each directory.dirs as dir}
				<svelte:self
					directory={dir}
					prevPath={prevPath === '' ? directory.name : `${prevPath}/${directory.name}`}
					{getModel}
					{setModel}
					on:create-file={(evt) => dispatch('create-file', `${directory.name}/${evt.detail}`)}
					on:create-dir={(evt) => dispatch('create-dir', `${directory.name}/${evt.detail}`)}
				/>
			{/each}
		{/if}
		{#if directory.files.length > 0}
			{#each directory.files as file}
				<FileElement
					{file}
					model={getModel(prevPath === '' ? `${directory.name}/${file}` : `${prevPath}/${directory.name}/${file}`)}
					on:click={(model) => setModel(model.detail)}
				/>
			{/each}
		{/if}
	</Stack>
</Stack>

<style>
	.icon {
		height: 1em;
		display: block;
		margin-bottom: 0;
	}
</style>
