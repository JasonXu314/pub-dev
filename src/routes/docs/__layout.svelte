<script lang="ts">
	import { page } from '$app/stores';
	import { Anchor, AppShell, Container, Group, Image, Seo, Stack, Title } from '@svelteuidev/core';

	const pages = [
		[
			'Docs',
			{
				routing: 'Routing',
				pages: 'Web Pages',
				'api-routes': 'API Routes'
			}
		],
		[
			'Tutorials',
			{
				'basic-todo': 'Basic Todo App',
				'todo-backend': 'Persisting Your Data'
			}
		]
	];

	function getPageName() {
		const path = $page.url.pathname.replace('/docs/', '') as keyof typeof pages[keyof typeof pages];
		return pages.find(([, pages]) => Object.keys(pages).includes(path))![1][path];
	}
</script>

<svelte:head>
	<link href="/prism/prism.css" rel="stylesheet" />
	<script src="/prism/prism.js" data-manual></script>
</svelte:head>
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
			{#each pages as [category, pages]}
				<Title order={3}>{category}</Title>
				{#each Object.entries(pages) as [path, title]}
					<Anchor href="/docs/{path}" underline={$page.url.pathname === `/docs/${path}`}>{title}</Anchor>
				{/each}
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

	:global(pre code) {
		display: block;
		white-space: pre-wrap !important;
	}
</style>
