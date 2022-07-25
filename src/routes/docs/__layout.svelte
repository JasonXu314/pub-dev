<script>
	import { page } from '$app/stores';
	import { Anchor, AppShell, Container, Group, Image, Stack, Title } from '@svelteuidev/core';

	const pages = {
		'basic-todo': 'Basic Todo App'
	};
</script>

<AppShell>
	<Container slot="navbar" override={{ paddingTop: '$lgPX' }}>
		<Stack>
			<Anchor href="/">
				<Group align="center">
					<Image src="/favicon.ico" alt="" override={{ display: 'inline-block', '& img': { marginBottom: '0 !important' } }} />
					<Title override={{ margin: '0 !important' }} color="blue">PubDev</Title>
				</Group>
			</Anchor>
			<Anchor href="/docs" underline={$page.url.pathname === '/docs'}>Getting Started</Anchor>
			{#each Object.entries(pages) as [path, title]}
				<Anchor href={`/docs/${path}`} underline={$page.url.pathname === `/docs/${path}`}>{title}</Anchor>
			{/each}
		</Stack>
	</Container>
	<Container>
		<slot />
	</Container>
</AppShell>
