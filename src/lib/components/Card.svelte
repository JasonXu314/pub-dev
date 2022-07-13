<script lang="ts">
	import { Badge, Group, Paper, Stack, Title } from '@svelteuidev/core';

	export let title: string;
	export let badge: string | undefined = undefined;
</script>

<Paper withBorder>
	<Stack justify="space-between" override={{ height: '100%' }}>
		<Stack spacing={0}>
			<Title order={2} override={{ marginTop: '0 !important' }}>
				{title}
				{#if badge}
					<Badge>{badge}</Badge>
				{/if}
			</Title>
			<slot />
		</Stack>
		<Group>
			<slot name="actions" />
		</Group>
	</Stack>
</Paper>
