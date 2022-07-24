<script lang="ts">
	import { StarterStoryPhase } from '$lib/utils';
	import alert from '@iconify/icons-mdi/alert-circle-outline';
	import Icon from '@iconify/svelte';
	import { Alert, Box, Button, Code, Group, Kbd, Space } from '@svelteuidev/core';

	import StoryPopper from './StoryPopper.svelte';

	export let phase: StarterStoryPhase;
	export let fsDiv: HTMLDivElement;
	export let viewPageButton: HTMLButtonElement;
	export let fsStack: HTMLElement;
	export let createFileButton: HTMLButtonElement;
	export let createButton: HTMLButtonElement;

	let _createFileButton: HTMLButtonElement;

	$: setTimeout(() => (_createFileButton = createFileButton), 100);
</script>

{#if phase === StarterStoryPhase.SHOW_FILESYSTEM}
	<StoryPopper reference={fsDiv}>
		The left sidebar shows your project files. At the root of the project are 2 folders: <Code>public</Code> and <Code>routes</Code>.
		<Space h="sm" />
		The folders in the <Code>routes</Code> folder become pages in your website, mirroring the folder structure. The files in your
		<Code>public</Code> folder become static assets.
		<Space h="sm" />
		Try clicking on the <Code>index.html</Code> file in your <Code>routes</Code> folder.
		<Space h="sm" />
		<Button color="blue" on:click={() => (phase = StarterStoryPhase.EDIT_PAGE)}>Next</Button>
	</StoryPopper>
{:else if phase === StarterStoryPhase.EDIT_PAGE}
	<StoryPopper reference={fsDiv}>
		You can see that an <Code>index.html</Code> file has been generated for you with some starter code. Try adding some content to it and saving (<Kbd
			>{typeof window !== 'undefined' && navigator.userAgent.includes('Win') ? 'Ctrl' : '⌘'}</Kbd
		>
		<Box root="span" css={{ margin: '0 5px' }}>+</Box>
		<Kbd>S</Kbd>)
		<Space h="sm" />
		<Group>
			<Button variant="outline" on:click={() => (phase = StarterStoryPhase.SHOW_FILESYSTEM)}>Back</Button>
			<Button color="blue" on:click={() => (phase = StarterStoryPhase.VIEW_PAGE)}>Next</Button>
		</Group>
	</StoryPopper>
{:else if phase === StarterStoryPhase.VIEW_PAGE}
	<StoryPopper reference={viewPageButton}>
		You can see the contents of this page by clicking the above button (don't worry, it opens in a new tab).
		<Space h="sm" />
		<Group>
			<Button variant="outline" on:click={() => (phase = StarterStoryPhase.EDIT_PAGE)}>Back</Button>
			<Button color="blue" on:click={() => (phase = StarterStoryPhase.CREATE_PAGE)}>Next</Button>
		</Group>
	</StoryPopper>
{:else if phase === StarterStoryPhase.CREATE_PAGE}
	<StoryPopper position="right" reference={fsStack}>
		If you hover over a folder in the file system, you will see 2 buttons towards the right: one to create a new file, and one to create a new folder. Try
		creating a new html file under the <Code>routes</Code> folder.
		<Space h="sm" />
		<Group>
			<Button variant="outline" on:click={() => (phase = StarterStoryPhase.VIEW_PAGE)}>Back</Button>
			<Button color="blue" on:click={() => (phase = StarterStoryPhase.SELECT_CREATION)}>Ok</Button>
		</Group>
	</StoryPopper>
{:else if phase === StarterStoryPhase.SELECT_CREATION}
	<StoryPopper position="right" reference={_createFileButton} override={{ transform: 'translateY(-36px)' }}>
		There are several methods of creating files that we support, but for now you can just create an empty file with the "Create New File" button.
		<Space h="sm" />
		<Group>
			<Button variant="outline" on:click={() => (phase = StarterStoryPhase.CREATE_PAGE)}>Back</Button>
			<Button color="blue" on:click={() => (phase = StarterStoryPhase.NAME_FILE)}>Ok</Button>
		</Group>
	</StoryPopper>
{:else if phase === StarterStoryPhase.NAME_FILE}
	<StoryPopper position="bottom" reference={createButton}>
		Give your file a name (this will become the URL of the new page in your website) and click the "Create File" button when you're ready!
		<Space h="sm" />
		<Alert color="blue" variant="filled" icon={Icon} iconProps={{ icon: alert }}>
			Remember to include the <Code>.html</Code> extension. That's how we know that your file is a page in your website!
		</Alert>
		<Space h="sm" />
		<Group>
			<Button variant="outline" on:click={() => (phase = StarterStoryPhase.SELECT_CREATION)}>Back</Button>
			<Button color="blue" on:click={() => (phase = StarterStoryPhase.POPULATE_PAGE)}>Ok</Button>
		</Group>
	</StoryPopper>
{:else if phase === StarterStoryPhase.POPULATE_PAGE}
	<StoryPopper position="right" reference={fsStack} placement="center">
		This is the content of your new page. Try copy-pasting the following content into your new page:
		<pre style="color: var(--svelteui-colors-gray400)">{`<html>
	<body>
		<p id="counter" name="counter">0</p>
		<button onclick="document.body.children.counter.textContent++">Click Me!</button>
	</body>
</html>`}</pre>
		<Space h="sm" />
		<Alert color="blue" variant="filled" icon={Icon} iconProps={{ icon: alert }}>
			Do note that this is a pretty hackish way of making a counter, and would never be actually used in modern web development.
		</Alert>
		<Space h="sm" />
		<Group>
			<Button variant="outline" on:click={() => (phase = StarterStoryPhase.NAME_FILE)}>Back</Button>
			<Button color="blue" on:click={() => (phase = StarterStoryPhase.VIEW_NEW_PAGE)}>Next</Button>
		</Group>
	</StoryPopper>
{:else if phase === StarterStoryPhase.VIEW_NEW_PAGE}
	<StoryPopper reference={viewPageButton}>
		Try viewing your new page!
		<Space h="sm" />
		<Group>
			<Button variant="outline" on:click={() => (phase = StarterStoryPhase.POPULATE_PAGE)}>Back</Button>
			<Button color="blue" on:click={() => (phase = StarterStoryPhase.TUTORIALS)}>Next</Button>
		</Group>
	</StoryPopper>
{:else if phase === StarterStoryPhase.TUTORIALS}
	<StoryPopper position="right" reference={fsStack} placement="center">
		And that's it for the introduction! Be sure to checkout our <a href="/docs" target="_blank" rel="noreferrer noopener">docs</a> for more tutorials and
		examples.
		<Space h="sm" />
		<Group>
			<Button variant="outline" on:click={() => (phase = StarterStoryPhase.VIEW_NEW_PAGE)}>Back</Button>
			<Button color="blue" on:click={() => (phase = StarterStoryPhase.COMPLETED)}>Yay</Button>
		</Group>
	</StoryPopper>
{/if}
