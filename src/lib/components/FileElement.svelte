<script lang="ts">
	import { currentModel } from '$lib/stores';
	import { getMIMEType } from '$lib/utils';
	import { Group, Text, UnstyledButton } from '@svelteuidev/core';
	import { createEventDispatcher } from 'svelte';

	export let file: string;
	export let model: FileModel;

	const dispatch = createEventDispatcher<{ click: FileModel; context: ContextEvent }>();

	// it's actually a PointerEvent, but svelteui's types are bad i think
	function dispatchContext(evt: any) {
		dispatch('context', { path: file, type: 'file', pos: [evt.pageX, evt.pageY] });
	}
</script>

<UnstyledButton on:click={() => dispatch('click', model)} on:contextmenu!preventDefault={dispatchContext}>
	<Group
		noWrap
		spacing={6}
		override={{
			cursor: 'pointer',
			paddingLeft: 22,
			paddingTop: 4,
			paddingBottom: 4,
			'&:hover': {
				background: '$dark500'
			},
			background: $currentModel === model ? '$dark500' : undefined
		}}
	>
		{@const mimeType = getMIMEType(model.path)}
		{#if mimeType === 'image/png' || mimeType === 'image/jpeg'}
			<img class="icon" src="https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/main/icons/image.svg" alt="" />
		{:else if mimeType === 'image/x-icon'}
			<img class="icon" src="https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/main/icons/favicon.svg" alt="" />
		{/if}
		<img class="icon" src="https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/main/icons/{model.model.getLanguageId()}.svg" alt="" />
		<Text>
			{file}
		</Text>
	</Group>
</UnstyledButton>

<style>
	.icon {
		height: 1em;
		display: block;
		margin-bottom: 0;
	}
</style>
