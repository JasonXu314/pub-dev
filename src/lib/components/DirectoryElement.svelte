<script lang="ts">
	import { Group, Stack, Text, UnstyledButton } from '@svelteuidev/core';
	import type { editor } from 'monaco-editor';
	import FileElement from './FileElement.svelte';

	export let dir: Directory;
	export let getModel: (name: string) => editor.IModel;
	export let setModel: (model: editor.IModel) => void;

	let open: boolean = true;
</script>

<Stack spacing={4} justify="start" override={{ maxHeight: open ? 'unset' : 24, overflow: 'hidden' }}>
	<UnstyledButton on:click={() => (open = !open)}>
		<Group
			noWrap
			spacing={6}
			override={{
				cursor: 'pointer',
				paddingTop: 4,
				paddingBottom: 4,
				'&:hover': {
					background: '$dark500'
				}
			}}
		>
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
				{dir.name}
			</Text>
		</Group>
	</UnstyledButton>
	<Stack spacing={4} justify="start" override={{ paddingLeft: 24 }}>
		{#if dir.dirs.length > 0}
			{#each dir.dirs as dir}
				<svelte:self {dir} {getModel} {setModel} />
			{/each}
		{/if}
		{#if dir.files.length > 0}
			{#each dir.files as file}
				<FileElement {file} model={getModel(`${dir.name}/${file}`)} on:click={(model) => setModel(model.detail)} />
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
