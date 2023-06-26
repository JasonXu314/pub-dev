<script lang="ts">
	import { makeHTMLSafe } from '$lib/utils';

	import alert from '@iconify/icons-mdi/alert-circle-outline';
	import Icon from '@iconify/svelte';
	import { Alert, Anchor, Code, Space, Text, Title } from '@svelteuidev/core';
	import { onMount, tick } from 'svelte';

	const responseObjSpec = makeHTMLSafe(`type EndpointResponse = {
	status: number;
	data: Object;
	headers?: Object;
};`),
		exampleResponse = makeHTMLSafe(`{
	status: 200,
	data: 'Hello, World!',
	headers: {
		'Content-Type': 'text/plain'
	}
}`);

	onMount(() => {
		tick().then(() => {
			(window as any).Prism.highlightAllUnder(document.body);
		});
	});
</script>

<Title>Databases</Title>
<Text>
	Databases are the primary way to preserve data between requests to an API, or share data between multiple API endpoints. PubDev makes database-like
	functionality available to API endpoints via the <Code>db:nosql</Code> and <Code>db:sql</Code> modules.
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
	<code class="language-typescript">{@html responseObjSpec}</code>
</pre>
<Text>
	The <Code>status</Code> property will determine the <Anchor href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Status" external>status code</Anchor>
	of the response.
</Text>
<Space h="sm" />
<Text>
	The <Code>data</Code> property will be the body of the response. Currently, all responses are serialized as JSON.
</Text>
<Space h="sm" />
<Text>
	The optional <Code>headers</Code> property represents the response headers. For example, if you wanted to set the <Code>Content-Type</Code> header, you could
	return an object like so:
</Text>
<pre>
	<code class="language-javascript">{@html exampleResponse}</code>
</pre>

<Title order={2}>WebSocket Gateways</Title>
<Text>
	If an endpoint exports an <Code>onMessage</Code> function, it will be treated as a WebSocket gateway. WebSocket gateways are not allowed to export handlers
	for any of the REST methods, but instead should export handlers for WebSocket events.
</Text>
<Space h="sm" />
<Text>
	The <Code>onMessage</Code> function will be called whenever a message is received from a connected client. This function will be passed the client socket, and
	the message received. This function is required to identify an endpoint as a WebSocket Gateway.
</Text>
<Space h="sm" />
<Text>
	The <Code>onConnection</Code> function will be called whenever a client connects to the gateway. It will be passed the client socket.
</Text>
<Space h="sm" />
<Text>
	The <Code>onDisconnect</Code> function will be called whenever a client disconnects from the gateway. This function will be passed the client socket and the
	reason for disconnecting.
</Text>
