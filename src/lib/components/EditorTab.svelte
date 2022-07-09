<script lang="ts">
	import { ActionIcon, Group, Text } from '@svelteuidev/core';
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
		},
		paddingRight: 5,
		paddingLeft: 5
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
	<ActionIcon
		variant="hover"
		size="xs"
		on:click={() => dispatch('close')}
		override={{ color: '$gray300 !important', '&:hover': { backgroundColor: '$gray700 !important' } }}
	>
		<Cross2 />
	</ActionIcon>
</Group>
