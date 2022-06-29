<script lang="ts">
	import { AppShell, Container, Stack, Text } from '@svelteuidev/core';
</script>

<AppShell>
	<Stack slot="navbar">
		<Text>Test 1</Text>
		<Text>Test 2</Text>
		<Text>Test 3</Text>
	</Stack>
	<slot>
		<Container>
			<Text>Hi</Text>
		</Container>
	</slot>
</AppShell>
