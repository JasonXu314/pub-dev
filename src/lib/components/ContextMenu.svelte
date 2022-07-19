<script lang="ts">
	import { _portal } from '$lib/utils';

	import del from '@iconify/icons-mdi/delete';
	import filePlus from '@iconify/icons-mdi/file-plus-outline';
	import folderPlus from '@iconify/icons-mdi/folder-plus-outline';
	import rename from '@iconify/icons-mdi/rename-box';
	import { Divider, Paper, Stack } from '@svelteuidev/core';
	import { createEventDispatcher } from 'svelte';
	import MenuItem from './MenuItem.svelte';

	export let menuX: number;
	export let menuY: number;
	export let menuType: 'file' | 'directory';

	const dispatch = createEventDispatcher<{ delete: void; rename: void; 'create-folder': void; 'create-file': void }>();
</script>

<Paper
	use={[_portal]}
	override={{ position: 'absolute', top: `${menuY}px`, left: `${menuX}px`, padding: 0, borderRadius: '$sm', border: '1px solid $dark300' }}
>
	<Stack spacing={0}>
		{#if menuType === 'directory'}
			<MenuItem icon={filePlus} on:click={() => dispatch('create-file')}>New File</MenuItem>
			<MenuItem icon={folderPlus} on:click={() => dispatch('create-folder')}>New Folder</MenuItem>
			<Divider override={{ marginTop: '6px !important', marginBottom: '6px !important' }} />
		{/if}
		<MenuItem icon={del} on:click={() => dispatch('delete')}>
			Delete {menuType === 'directory' ? 'Folder' : 'File'}
		</MenuItem>
		<MenuItem icon={rename} on:click={() => dispatch('rename')}>
			Rename {menuType === 'directory' ? 'Folder' : 'File'}
		</MenuItem>
	</Stack>
</Paper>
