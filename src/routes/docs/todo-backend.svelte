<script>
	import { makeHTMLSafe } from '$lib/utils';
	import alert from '@iconify/icons-mdi/alert-circle-outline';
	import Icon from '@iconify/svelte';
	import { Alert, Anchor, Code, Image, Space, Tabs, Text, Title } from '@svelteuidev/core';

	let basics = {
			sql: makeHTMLSafe(`const db = require('db:sql');

// The handlers for the different HTTP methods will go in here
module.exports = {
	setup: () => { // this is called in order to set up our endpoint (after each save, etc.)
		// create a table if it doesn't exist
		// note: we could drop the table in a cleanup function if we wanted to discard previous data
		db.create('todos', db.schema({ // this describes the shape of all the objects we'll store in the table
			id: db.PrimaryKey, // this is a unique id for each todo; the SQL db will generate one for us for each todo
			name: String,
			description: String,
			completed: Boolean
		}));
	}
};`),
			nosql: makeHTMLSafe(`const db = require('db:nosql');

// The handlers for the different HTTP methods will go in here
module.exports = {};`)
		},
		cr = {
			sql: makeHTMLSafe(`module.exports = {
	/* ... */
	get: () => { // here we just return all of the todos
		// PubDev will take this returned object and translate it into an HTTP response
		return {
			status: 200,
			// this will become our response body
			data: db.select(db.ALL).from('todos').exec()
		};
	},
	post: (req) => { // here we create a new todo
		return {
			status: 201,
			data: db.insert().into('todos').values(req.body).exec()
		};
	}
};`),
			nosql: makeHTMLSafe(`module.exports = {
	/* ... */
	get: () => {
		return {
			status: 200,
			data: db.collection('todos').find({})
		};
	},
	post: (req) => {
		return {
			status: 201,
			data: db.collection('todos').insert(req.body)
		};
	}
};`)
		},
		crFrontend = [
			makeHTMLSafe(`fetch('/api', { method: 'GET' }) // we want to make a GET request to our API route in order to fetch data
	.then((res) => res.json()) // we want to get the response data as a JSON object
	.then((data) => {
		todos = data; // use the existing data from the server
		rebuildList(); // update the UI
	});`),
			makeHTMLSafe(`// we want to make a POST request to our API route in order to to upload data
fetch('/api', {
	method: 'POST',
	body: JSON.stringify(todo),
	headers: { // we need to tell the backend we're sending JSON, so that it parses the body correctly
		'Content-Type': 'application/json'
	}
}).then((res) => res.json()) // we want to get the response data as a JSON object
	.then((todo) => {
		todos.push(todo); // add the todo to the list
		rebuildList(); // update the UI
	});`)
		];
</script>

<Title>Todo App</Title>
<Title order={3} override={{ marginTop: '$smPX !important' }}>
	This tutorial will show you how to make a backend for the todo app created in the previous tutorial.
</Title>
<Alert color="yellow" title="Important!" icon={Icon} iconProps={{ icon: alert }}>
	This project depends on the <Anchor href="/docs/basic-todo">previous tutorial</Anchor>, so make sure to complete that first!
</Alert>
<Title order={2}>But my todos don't save!</Title>
<Text>You may have noticed that refreshing the page deletes all the todo data. This is because website data is not saved between visits to your site.</Text>
<Space h="sm" />
<Text>
	The simplest way to preserve data between visits is to run a server and store the data on the server, which is what we'll be doing in this tutorial.
</Text>
<Title order={2}>Setup</Title>
<Text>You should have a project with the following files from the previous tutorial:</Text>
<Image
	src="/tutorials/basic-todo/starter.png"
	override={{ paddingTop: '$lgPX', '& img': { maxHeight: '6em !important', width: 'unset !important' } }}
	fit="contain"
/>
<Text>Create a new file in the <Code>routes</Code> folder called <Code>api.js</Code>.</Text>
<Space h="lg" />
<Alert color="blue" title="Important!" icon={Icon} iconProps={{ icon: alert }}>
	Make sure to include the <Code>.js</Code> extension, so that we can recognize your file as an API endpoint!
</Alert>

<Title order={2}>Backend</Title>
<Text>
	We will be using a database to store our todos. PubDev allows you to choose between using a NoSQL database or a SQL style database (albeit with pretty
	limited features for now).
</Text>
<Space h="sm" />
<Tabs override={{ '& button:not(.active)': { color: 'White' } }}>
	<Tabs.Tab label="With NoSQL DB">
		<pre>{@html basics.nosql}</pre>
	</Tabs.Tab>
	<Tabs.Tab label="With SQL DB">
		<pre>{@html basics.sql}</pre>
	</Tabs.Tab>
</Tabs>
<Text>
	Next, create the <Code>GET</Code> and <Code>POST</Code> endpoints (these should go inside of the <Code>module.exports</Code> object):
</Text>
<Tabs override={{ '& button:not(.active)': { color: 'White' } }}>
	<Tabs.Tab label="With NoSQL DB">
		<pre>{@html cr.nosql}</pre>
	</Tabs.Tab>
	<Tabs.Tab label="With SQL DB">
		<pre>{@html cr.sql}</pre>
	</Tabs.Tab>
</Tabs>
<Text>
	This will allow our API endpoint to receive and send back data via the <Code>POST</Code> and <Code>GET</Code> HTTP methods. Now, we just need the front end
	to send that data.
</Text>

<Title order={2}>Frontend</Title>
<Text>
	We can use the <Code>fetch</Code> API built into most browsers to make a HTTP request. Insert the following code after your <Code>todos</Code>
	array declaration:
</Text>
<pre>{@html crFrontend[0]}</pre>
<Text>
	This will make a HTTP request to your backend as soon as the page loads, and gets the existing todos from the server. However, we still aren't uploading
	our todos for the server to store.
</Text>
<Space h="sm" />
<Text>Replace the <Code>todos.push</Code> and <Code>rebuildList()</Code> lines in the submit listener with the following:</Text>
<pre>{@html crFrontend[1]}</pre>
<Text>Now try creating a todo and refershing the page. You should see that the todo is persisted, even through multiple visits to the page.</Text>

<Title order={2}>Completion</Title>
<Text>
	At this point, your server is storing the todos you create, and serving them to the frontend on visits, but you may notice that the completion data isn't
	being saved. This is because while we changed the completed status on the frontend, the backend data is not changed.
</Text>
