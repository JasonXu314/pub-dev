<script lang="ts">
	import { currentModel } from '$lib/stores';
	import { Group, Text, UnstyledButton } from '@svelteuidev/core';
	import { createEventDispatcher } from 'svelte';

	export let file: string;
	export let model: FileModel;

	const dispatch = createEventDispatcher<{ click: FileModel }>();
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
		{#if model.model.getLanguageId() === 'html'}
			<img class="icon" src="https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/main/icons/html.svg" alt="" />
		{:else if model.model.getLanguageId() === 'javascript'}
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
