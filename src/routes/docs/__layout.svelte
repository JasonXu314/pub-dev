<script lang="ts">
	import { page } from '$app/stores';
	import { Anchor, AppShell, Container, Group, Image, Seo, Stack, Title } from '@svelteuidev/core';

	const pages = {
		'basic-todo': 'Basic Todo App',
		'todo-backend': 'Persisting Your Data'
	};

	function getPageName() {
		return pages[$page.url.pathname.replace('/docs/', '') as keyof typeof pages];
	}
</script>

<Seo title={$page.url.pathname === '/docs' ? 'PubDev Docs' : `PubDev Docs | ${getPageName()}`} />
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
				<Anchor href="/docs/{path}" underline={$page.url.pathname === `/docs/${path}`}>{title}</Anchor>
			{/each}
		</Stack>
	</Container>
	<Container>
		<slot />
	</Container>
</AppShell>

<style>
	:global(pre) {
		tab-size: 4ch;
	}
</style>
