<script lang="ts">
	import type { IconifyIcon } from '@iconify/svelte';
	import Icon from '@iconify/svelte';
	import { Group, UnstyledButton } from '@svelteuidev/core';

	export let icon: IconifyIcon;
</script>

<UnstyledButton
	override={{
		padding: '0.25em 0.5em',
		'&:hover': {
			background: '$dark500',

			'&:first-child': {
				borderRadius: '$sm $sm 0 0'
			},

			'&:last-child': {
				borderRadius: '0 0 $sm $sm'
			}
		}
	}}
	on:click
>
	<Group>
		<Icon {icon} />
		<slot />
	</Group>
</UnstyledButton>
