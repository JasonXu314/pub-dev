<script>
	import { Button, Center, Container, Group, Image, Space, Stack, Text, Title } from '@svelteuidev/core';
</script>

<Container>
	<Group align="center" override={{ paddingTop: '$lgPX', paddingBottom: '$lgPX' }} grow>
		<Image src="/favicon.ico" alt="" override={{ display: 'inline-block', flexGrow: 0.1, '& img': { marginBottom: '0 !important' } }} />
		<Title override={{ margin: '0 !important', fontSize: '6em !important' }} color="blue">PubDev</Title>
	</Group>
	<Title variant="gradient" gradient={{ from: 'cyan', to: 'indigo', deg: 45 }}>
		HTML/CSS/JS
		<Title
			root="span"
			variant="gradient"
			gradient={{ from: 'orange', to: 'pink', deg: 45 }}
			override={{
				fontWeight: '$extrabold',
				position: 'relative',
				'&::after': {
					content: '""',
					position: 'absolute',
					bottom: '2px',
					left: '0',
					width: '100%',
					height: '3px',
					background: 'linear-gradient(45deg, $orange600, $pink600)'
				}
			}}
		>
			fullstack
		</Title>
		web apps.
	</Title>
	<Title order={2} underline override={{ marginTop: '0 !important' }}>Free forever.</Title>

	<Stack spacing={32}>
		<Group align="center" position="apart" spacing={32} grow>
			<Title color="orange">Build websites with native web technologies</Title>
			<Image src="/html.png" />
		</Group>
		<Group align="center" position="apart" spacing={32} grow>
			<Image src="/endpoint.png" />
			<Title color="yellow">And backend endpoints in javascript</Title>
		</Group>
		<Group align="center" position="apart" spacing={32} grow>
			<Title color="indigo">With built-in databases<Title variant="link" root="a" href="#db-note">*</Title></Title>
			<Image src="/db.png" caption="Also supports mongodb-style nosql DB" />
		</Group>
		<Center>
			<Title>Right in the browser, with instant redeployments</Title>
		</Center>
		<Center>
			<Image alt="Gif Here" />
		</Center>
		<Center>
			<Title>Actively developed</Title>
		</Center>
		<Center override={{ marginTop: -40 }}>
			<Text>(new features coming soon!)</Text>
		</Center>
	</Stack>

	<Center>
		<Title override={{ fontSize: '6em !important' }}>Get Started:</Title>
	</Center>
	<Space h="sm" />
	<Center>
		<Group>
			<Button variant="gradient" href="/new" size="xl" gradient={{ from: 'blue', to: 'teal', deg: 45 }} override={{ color: 'white !important' }}>
				Create a new project
			</Button>
			<Button variant="gradient" href="/docs" size="xl" gradient={{ from: 'green', to: 'indigo', deg: 45 }} override={{ color: 'white !important' }}>
				Or check out the docs
			</Button>
		</Group>
	</Center>

	<Space h={128} />
	<Text>
		<div id="db-note">*not actual databases, they're just in-memory mocks to replicate db-like programming experience</div>
	</Text>
</Container>
