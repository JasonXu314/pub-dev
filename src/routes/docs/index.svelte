<script>
	import { Anchor, Code, Space, Text, Title } from '@svelteuidev/core';
</script>

<Title>Getting Started</Title>
<Text>
	All programming is done through the browser; go <Anchor href="/new" external>here</Anchor> to create a new project. If it's your first time, you will be able
	to go through a guided tour of PubDev's development interface.
</Text>
<Title order={2}>Features</Title>
<Text>
	The objective of PubDev is to create a sandbox environment for learning full-stack development with the most fundamental web technologies. That is, HTML,
	JS, and CSS. That being said, the web is continuously evolving, so we plan to add support for more modern technologies and techniques in the future.
	However, the main focus on raw HTML/JS for the frontend will remain.
</Text>
<Space h="sm" />
<Text>We currently support the following features:</Text>
<ul>
	<li><Anchor href="/docs/routing">Filesystem-based routing</Anchor></li>
	<ul>
		<li><Anchor href="/docs/pages">HTML web pages</Anchor></li>
		<li><Anchor href="/docs/api-routes">JS API endpoints</Anchor></li>
	</ul>
	<li>Static asset hosting</li>
	<li>SQL + NoSQL databases</li>
	<li><Code>context</Code> API</li>
	<li>WebSocket servers</li>
</ul>
