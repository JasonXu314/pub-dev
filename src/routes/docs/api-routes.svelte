<script lang="ts">
	import { makeHTMLSafe } from '$lib/utils';

	import alert from '@iconify/icons-mdi/alert-circle-outline';
	import Icon from '@iconify/svelte';
	import { Alert, Anchor, Code, Space, Text, Title } from '@svelteuidev/core';
	import { onMount, tick } from 'svelte';

	const responseObjSpec = makeHTMLSafe(`{
	status: number,
	data: object,
	headers: object
}`);

	onMount(() => {
		tick().then(() => {
			(window as any).Prism.highlightAllUnder(document.body);
		});
	});
</script>

<Title>API Routes</Title>
<Text>
	PubDev attempts to interpret all JavaScript file under the <Code>routes</Code> folder as API endpoints. There are 2 types of endpoints: REST endpoints, and
	WebSocket gateways.
</Text>
<Space h="sm" />
<Text>
	Both REST endpoints and WebSocket gateways are allowed to export <Code>setup</Code> and <Code>cleanup</Code> functions. The <Code>cleanup</Code> function will
	be run immediately after changes to the endpoint are received, and should clean up any resources that were used in previous versions of the endpoint, such as
	closing WebSockets and servers, or resetting databases. The <Code>setup</Code> function will be run immediately after the endpoint is loaded, and should be
	used to perform any tasks that the endpoint depends on to run, such as setting up databases, or pre-populating data.
</Text>
<Title order={2}>REST Endpoints</Title>
<Text>
	REST endpoints are allowed to export handlers for each <Anchor href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods" external
		>HTTP Method</Anchor
	>. These handlers should match the name of the HTTP method, but in lower case. For example, if your endpoint exported a <Code>get</Code> function, that function
	would be called on HTTP <Code>GET</Code> requests.
</Text>
<Space h="lg" />
<Alert color="red" title="Note:" icon={Icon} iconProps={{ icon: alert }}>
	The HTTP <Code>DELETE</Code> method is an exception to this; since <Code>delete</Code> is a keyword in JavaScript, exporting a <Code>del</Code> handler will
	receive any <Code>DELETE</Code> requests.
</Alert>
<Space h="lg" />
<Text>Each endpoint handler should return an object representing the data of the response:</Text>
<pre>
	<code class="language-javascript">{@html responseObjSpec}</code>
</pre>
<Text>
	The <Code>status</Code> attribute will determine the <Anchor href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Status" external>status code</Anchor>
	of the response.
</Text>
<Space h="sm" />
<Text />
