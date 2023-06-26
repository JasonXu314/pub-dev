<script lang="ts">
	import { Code, Space, Text, Title } from '@svelteuidev/core';
	import { onMount, tick } from 'svelte';

	onMount(() => {
		tick().then(() => {
			(window as any).Prism.highlightAllUnder(document.body);
		});
	});
</script>

<Title>Static Assets</Title>
<Text>
	The other special top-level directory is the <Code>public</Code> directory. Any files or directories placed in this directory will be served as-is on any request.
</Text>
<Space h="sm" />
<Text>You can use this directory to serve images, CSS, JavaScript, or any files that just need to be publicly available for your website.</Text>
