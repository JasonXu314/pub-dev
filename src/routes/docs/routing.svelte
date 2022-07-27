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
	HTML files under the routes directory will become web pages. For example, if you had an <Code>about.html</Code> file inside your <Code>routes</Code> directory,
	that code would be served to a user visitng the <Code>/about</Code> page of your site.
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
	HTML files under the routes directory will become web pages. For example, if you had an <Code>about.html</Code> file inside your <Code>routes</Code> directory,
	that code would be served to a user visitng the <Code>/about</Code> page of your site.
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
	To learn more about the intricacies of the routing system with regards to JS endpoints, see the <Anchor href="/docs/api-routes">API routes</Anchor> documentation
	for more information.
</Text>
