<script lang="ts">
	import { Button, Group, Text } from '@svelteuidev/core';
	import { createEventDispatcher } from 'svelte';
	import XIcon from './XIcon.svelte';

	export let fileName: string;

	const dispatch = createEventDispatcher<{ close: void }>();
</script>

<Group
	spacing={8}
	override={{
		'&:hover': {
			background: '$dark500'
		}
	}}
>
	<Text
		on:click
		override={{
			cursor: 'pointer'
		}}
	>
		{fileName}
	</Text>
	<Button compact variant="subtle" on:click={() => dispatch('close')} override={{ padding: 0 }}>
		<XIcon />
	</Button>
</Group>
