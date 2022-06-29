<script lang="ts">
	import { currentModel } from '$lib/stores';
	import { Group, Text, UnstyledButton } from '@svelteuidev/core';
	import type { editor } from 'monaco-editor';
	import { createEventDispatcher } from 'svelte';

	export let file: string;
	export let model: editor.IModel;

	const dispatch = createEventDispatcher<{ click: editor.IModel }>();
</script>

<UnstyledButton on:click={() => dispatch('click', model)}>
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
		{#if model.getLanguageId() === 'html'}
			<img class="icon" src="https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/main/icons/html.svg" alt="" />
		{:else if model.getLanguageId() === 'javascript'}
			<img class="icon" src="https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/main/icons/javascript.svg" alt="" />
		{/if}
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
