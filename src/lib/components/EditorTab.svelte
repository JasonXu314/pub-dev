<script lang="ts">
	import { Button, Group, Text } from '@svelteuidev/core';
	import { Cross2 } from 'radix-icons-svelte';
	import { createEventDispatcher } from 'svelte';

	export let fileName: string;

	const dispatch = createEventDispatcher<{ close: void }>();
</script>

<Group
	spacing={0}
	override={{
		height: '100%',
		cursor: 'pointer',
		'&:hover': {
			background: '$dark500'
		}
	}}
>
	<Text
		on:click
		override={{
			paddingLeft: '$smPX',
			paddingRight: '$smPX'
		}}
	>
		{fileName}
	</Text>
	<Button compact variant="subtle" on:click={() => dispatch('close')} override={{ padding: 2.5, height: 'fit-content' }}>
		<Cross2 />
	</Button>
</Group>
