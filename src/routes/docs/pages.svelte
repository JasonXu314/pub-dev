<script lang="ts">
	import { Code, Text, Title } from '@svelteuidev/core';
</script>

<Title>HTML Pages</Title>
<Text>Currently, HTML pages are simply served to visitors as-is. However, there are several features planned for the future:</Text>
<ul>
	<li>
		<Title order={3}>Route prefetching</Title>
		<Text>Certain endpoints will be able to automatically run on requests to pages, to fetch data to be sent down with the request.</Text>
	</li>
	<li>
		<Title order={3}>Route parameters</Title>
		<Text>
			Currently, there is no way to create dynamic routes (ie. a page that matches all of <Code>/users/1</Code>, <Code>/users/2</Code>, etc.). We plan to
			add support for this in the future.
		</Text>
	</li>
</ul>
<Text
	>HTML pages are prioritized over endpoints in the event of a name collision. For example, if a directory had a <Code>data.html</Code> and a <Code
		>data.js</Code
	> file, a <Code>GET</Code> request would retrieve the HTML page, not the endpoint.</Text
>
