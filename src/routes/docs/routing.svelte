<script lang="ts">
	import { Anchor, Code, Space, Text, Title } from '@svelteuidev/core';
</script>

<Title>Routing</Title>
<Text>
	PubDev uses filesystem-based routing, inspired by frameworks like
	<Anchor href="https://nextjs.org" external>Next.js</Anchor>
	and
	<Anchor href="https://kit.svelte.dev" external>SvelteKit</Anchor> (which this site was built with :D). All the files and directories under your
	<Code>routes</Code> directory become either web pages or API routes, depending on their file type.
</Text>

<Title order={3}>Web Pages</Title>
<Text>
	HTML files under the <Code>routes</Code> directory will become web pages. For example, if you had an <Code>about.html</Code> file inside your <Code
		>routes</Code
	> directory, that code would be served to a user visitng the <Code>/about</Code> page of your site.
</Text>
<Space h="sm" />
<Text>
	You can nest pages inside directories to create a hierarchy of pages. For example, if you had a <Code>blog</Code> directory inside your <Code>routes</Code>
	directory, and an <Code>about.html</Code> inside the <Code>blog</Code> directory, that code would be served to a user visiting the <Code>/blog/about</Code>
	page.
</Text>
<Space h="sm" />
<Text>
	A special case of this is the <Code>index.html</Code> file. If you have a <Code>index.html</Code> file in any directory, that will be considered a sort of "default
	page" of that directory. If you had a <Code>blog</Code> directory under your <Code>routes</Code> directory, and an <Code>index.html</Code> inside your <Code
		>blog</Code
	> directory, that code would be served to a user visiting <Code>/blog</Code> OR <Code>/blog/index</Code>.
</Text>
<Space h="sm" />
<Text>
	To learn more about the intricacies of the routing system with regards to HTML pages, see the <Anchor href="/docs/pages">Web Pages</Anchor> documentation for
	more information.
</Text>

<Title order={3}>API Endpoints</Title>
<Text>
	Similarly, JavaScript files under the <Code>routes</Code> directory will become API endpoints.
</Text>
<Space h="sm" />
<Text>As with HTML files, you can nest endpoints inside directories to create a hierarchy of API routes.</Text>
<Space h="sm" />
<Text>
	As with HTML files, any <Code>index.js</Code> file will become the "default endpoint" of the directory it is nested in, with the exception of the <Code
		>routes</Code
	> directory itself. Any request to your app's base URL will never be routed to an API endpoint; if there is no <Code>index.html</Code>, the request will
	return a 404.
</Text>
<Space h="sm" />
<Text>
	To learn more about the intricacies of the routing system with regards to JS endpoints, see the <Anchor href="/docs/api-routes">API routes</Anchor> documentation
	for more information.
</Text>

<Title order={3}>Static Assets</Title>
<Text>
	The other directory you can place at the root of your project is a <Code>public</Code> directory. ALL files and directories placed under this directory will
	be served, as-is, to any request made to that URL.
</Text>
<Space h="sm" />
<Text>
	For example, if you placed a <Code>styles.css</Code> file in your <Code>public</Code> directory, that file would be served to any request made to the <Code
		>/styles.css</Code
	> URL. If you instead placed it inside of a <Code>css</Code> directory, that file would be served to any request made to the <Code>/css/styles.css</Code>.
</Text>
<Space h="sm" />
<Text>
	Do note that the files in the <Code>public</Code> directory will not follow the "index conventions" as described above, and are subject to exact URL matching.
	Any request to a URL that does not match exactly to a file name will result in a 404.
</Text>
<Space h="sm" />
<Text>
	In addition, any name conflicts between assets in the <Code>public</Code> directory and routes in the <Code>routes</Code> directory will be resolved in favor
	of the <Code>routes</Code> directory.
</Text>
