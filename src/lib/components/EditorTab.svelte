<script lang="ts">
	import { Button, Group } from '@svelteuidev/core';
	import { createEventDispatcher } from 'svelte';
	import XIcon from './XIcon.svelte';

	export let fileName: string;

	const dispatch = createEventDispatcher<{ close: void }>();
</script>

<Group spacing={0}>
	<Button on:click>
		{fileName}
	</Button>
	<Button on:click={() => dispatch('close')}>
		<XIcon />
	</Button>
</Group>
