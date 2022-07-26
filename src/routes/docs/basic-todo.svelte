<script>
	import { makeHTMLSafe } from '$lib/utils';
	import alert from '@iconify/icons-mdi/alert-circle-outline';
	import Icon from '@iconify/svelte';
	import { Alert, Anchor, Button, Code, Group, Image, Space, Text, Title } from '@svelteuidev/core';

	let formCode = makeHTMLSafe(`<form id="form">
	<label for="todo-name">Name:</label>
	<input id="todo-name" placeholder="Todo Name" />
	<br />
	<label for="todo-description">Description:</label>
	<input id="todo-description" placeholder="Todo Description" />
	<br />
	<button type="submit">Add Todo</button>
</form>`);

	let initCode = makeHTMLSafe(`// get the form and todo list
const form = document.getElementById('form'),
	todoList = document.getElementById('todos');
let todos = []; // create an empty array (this will store the todos that we have)`),
		buildTodoCode = makeHTMLSafe(`function buildTodo(todo) { // a function to build the UI for individual todos
	// making all the HTML elements that we'll need for the todo
	const li = document.createElement('li'),
		h4 = document.createElement('h4'),
		p = document.createElement('p'),
		checkbox = document.createElement('input');
	checkbox.type = 'checkbox'; // making the input a checkbox

	// setting the display data
	h4.textContent = todo.name;
	p.textContent = todo.description;
	checkbox.checked = todo.completed;

	// listening for the user to check the todo
	checkbox.addEventListener('change', (evt) => {
		if (evt.isTrusted) {
			todo.completed = !todo.completed;
			rebuildList();
		}
	});

	// attaching all the components to the list item
	li.append(h4, p, checkbox);
}`),
		addTodoCode = makeHTMLSafe(`function rebuildList() { // a function to update the UI whenever the todos change
	// throw out all the previous todos and make new ones
	todoList.replaceChildren(...todos.map((todo) => buildTodo(todo))));
}`),
		submitCode = makeHTMLSafe(`form.addEventListener('submit', (e) => {
	// prevent the default form submit behavior (ordinarily, the browser would reload the page)
	e.preventDefault();
	
	// find our input elements
	const nameInput = document.getElementById('todo-name'),
		descriptionInput = document.getElementById('todo-description');

	// get the todo data
	const name = nameInput.value, description = descriptionInput.value;

	const todo = { name, description, completed: false }; // make a new todo object
	todos.push(todo); // add the todo to the list
	rebuildList(); // update the UI

	// reset the form
	nameInput.value = '';
	descriptionInput.value = '';
});`);
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
<Alert color="blue" title="Important!" icon={Icon} iconProps={{ icon: alert }}>
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
<Text>First, let's set up some variables; make a <Code>script</Code> tag in the <Code>body</Code> and insert the following:</Text>
<pre>{@html initCode}</pre>
<Alert color="blue" icon={Icon} iconProps={{ icon: alert }}>
	The comments are here to explain what each line of code is doing, and are obviously not necessary.
</Alert>
<Space h="lg" />
<Text>Now we need to actually build the HTML elements for each todo:</Text>
<pre>{@html buildTodoCode}</pre>
<Alert color="blue" icon={Icon} iconProps={{ icon: alert }}>
	The <Code>rebuildList</Code> function is where we'll add the todos to the list (and is just below!).
</Alert>
<pre>{@html addTodoCode}</pre>
<Text>Now to call these functions whenever the user clicks the submit button:</Text>
<pre>{@html submitCode}</pre>
<Title order={3}>And, we're done!</Title>
<Text>We now have a website where we can create todos and mark them as completed/uncompleted.</Text>
<Text>Deleting todos and making the website pretty is left as an exercise to the reader.</Text>
<Space h="lg" />
<Alert color="green" title="Some Hints:" icon={Icon} iconProps={{ icon: alert }}>
	<ul>
		<li>Deleting a todo should be as simple as filtering the list and rebuilding the todo list.</li>
		<li><Code>list-style: none</Code> in CSS will remove the ugly dot at the start of each todo.</li>
	</ul>
</Alert>
<Space h="lg" />
<Button fullSize override={{ height: '6em', color: 'White !important', textDecoration: 'none !important' }} href="/docs/todo-backend">
	<Group align="center">
		<Title color="white" override={{ margin: '0 !important' }}>Next:</Title>
		<Title order={3} color="white" override={{ margin: '0.25em 0 0 !important' }}>Persisting your data</Title>
	</Group>
</Button>
