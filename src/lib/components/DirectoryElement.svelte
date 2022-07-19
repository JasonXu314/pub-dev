<script lang="ts">
	import chevronDown from '@iconify/icons-mdi/chevron-down';
	import chevronRight from '@iconify/icons-mdi/chevron-right';
	import filePlus from '@iconify/icons-mdi/file-plus-outline';
	import folder from '@iconify/icons-mdi/folder';
	import folderOpen from '@iconify/icons-mdi/folder-open';
	import folderPlus from '@iconify/icons-mdi/folder-plus-outline';
	import Icon from '@iconify/svelte';
	import { ActionIcon, Group, Stack, Text, UnstyledButton } from '@svelteuidev/core';
	import { createEventDispatcher } from 'svelte';
	import FileElement from './FileElement.svelte';

	export let directory: Directory;
	export let prevPath: string;
	export let getModel: (name: string) => FileModel;
	export let setModel: (model: FileModel) => void;

	const dispatch = createEventDispatcher<{ 'create-file': string; 'create-dir': string; context: ContextEvent }>();

	let open: boolean = true,
		hovering: boolean = false;

	function dispatchContext(evt: any) {
		dispatch('context', { path: directory.name, type: 'directory', pos: [evt.pageX, evt.pageY] });
	}
</script>

<Stack spacing={0} justify="start" override={{ maxHeight: open ? 'unset' : 24, overflow: 'hidden' }}>
	<UnstyledButton
		on:click={() => (open = !open)}
		on:mouseenter={() => (hovering = true)}
		on:mouseleave={() => (hovering = false)}
		on:contextmenu!preventDefault={dispatchContext}
	>
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
			<Group spacing={6} override={{ margin: '4px 2px' }}>
				<Group spacing={2}>
					{#if open}
						<Icon icon={chevronDown} />
						<Icon icon={folderOpen} />
					{:else}
						<Icon icon={chevronRight} />
						<Icon icon={folder} />
					{/if}
				</Group>
				<Text>
					{directory.name}
				</Text>
			</Group>
			<Group override={{ paddingRight: 6 }} spacing={4}>
				{#if hovering}
					<ActionIcon
						variant="hover"
						size={20}
						override={{ color: '$gray300 !important', '&:hover': { backgroundColor: '$gray700 !important' } }}
						on:click!stopPropagation={() => dispatch('create-file', directory.name)}
					>
						<Icon icon={filePlus} />
					</ActionIcon>
					<ActionIcon
						variant="hover"
						size={20}
						override={{ color: '$gray300 !important', '&:hover': { backgroundColor: '$gray700 !important' } }}
						on:click!stopPropagation={() => dispatch('create-dir', directory.name)}
					>
						<Icon icon={folderPlus} />
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
					on:context={({ detail: { type, path, pos } }) => dispatch('context', { type, path: `${directory.name}/${path}`, pos })}
				/>
			{/each}
		{/if}
		{#if directory.files.length > 0}
			{#each directory.files as file}
				<FileElement
					{file}
					model={getModel(prevPath === '' ? `${directory.name}/${file}` : `${prevPath}/${directory.name}/${file}`)}
					on:click={(model) => setModel(model.detail)}
					on:context={({ detail: { type, path, pos } }) => dispatch('context', { type, path: `${directory.name}/${path}`, pos })}
				/>
			{/each}
		{/if}
	</Stack>
</Stack>
