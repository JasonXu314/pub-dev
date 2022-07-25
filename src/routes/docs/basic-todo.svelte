<script>
	import { END_SCRIPT, makeHTMLSafe } from '$lib/utils';
	import alert from '@iconify/icons-mdi/alert-circle-outline';
	import Icon from '@iconify/svelte';
	import { Alert, Anchor, Code, Image, Space, Text, Title } from '@svelteuidev/core';

	let formCode = makeHTMLSafe(`<form id="form">
	<label for="todo-name">Name:</label>
	<input id="todo-name" placeholder="Todo Name" />
	<br />
	<label for="todo-description">Description:</label>
	<input id="todo-description" placeholder="Todo Description" />
	<br />
	<button type="submit">Add Todo</button>
</form>`);

	let jsCode = makeHTMLSafe(`<script>
	const form = document.getElementById('form'); // get the form
	let todoList = []; // create an empty array (this will store the todos that we have)

	form.addEventListener('submit', (e) => {
		e.preventDefault(); // prevent the default submit behavior (ordinarily, the browser would take the user to a new page)
		
		const name = document.getElementById('todo-name').value; // get the name
		const description = document.getElementById('todo-description').value; // get the description
		const todo = { name, description, completed: false }; // make a new todo object
		todoList.push(todo); // add the todo to the list
	});
${END_SCRIPT}`);
</script>

<Title>Todo App</Title>
<Title order={3} override={{ marginTop: '$smPX !important' }}>This tutorial will show you how to create a basic todo app using PubDev</Title>

<Title order={2}>Setup</Title>
<Text>Begin by creating a <Anchor href="/new" external>new project</Anchor>. Your new project should look something like this:</Text>
<Image
	src="/tutorials/basic-todo/starter.png"
	override={{ paddingTop: '$lgPX', '& img': { maxHeight: '6em !important', width: 'unset !important' } }}
	fit="contain"
/>
<Text>Open the <Code>index.html</Code> file, and click the "Visit Page" button in the top left, and you should see something like this:</Text>
<Image
	src="/tutorials/basic-todo/starter-page.png"
	override={{ paddingTop: '$lgPX', '& img': { maxHeight: '6em !important', width: 'unset !important' } }}
	fit="contain"
/>

<Title order={2}>HTML</Title>
<Text>Begin by creating a form like so:</Text>
<pre>{@html formCode}</pre>
<Alert color="blue" icon={Icon} iconProps={{ icon: alert }}>
	Make sure to put this in the <Code>{'<body>'}</Code> tag of your page
</Alert>
<Space h="lg" />
<Text>Your page should now look something like this:</Text>
<Image
	src="/tutorials/basic-todo/form.png"
	override={{ paddingTop: '$lgPX', '& *': { width: 'fit-content !important' }, '& img': { maxHeight: '6em !important' } }}
	fit="contain"
	caption="This will differ based on operating systems"
/>
<Space h="lg" />
<Text>Below the form, create an unordered list. This will be where we put the todos.</Text>
<pre>{'<ul id="todos"></ul>'}</pre>

<Title order={2}>JS</Title>
<pre>{@html jsCode}</pre>
