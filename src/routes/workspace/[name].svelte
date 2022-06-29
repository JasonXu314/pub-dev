<script lang="ts">
	import { page } from '$app/stores';
	import DirectoryElement from '$lib/components/DirectoryElement.svelte';
	import FileElement from '$lib/components/FileElement.svelte';
	import { BACKEND_URL } from '$lib/env';
	import { currentModel } from '$lib/stores';
	import { AppShell, Button, Container, Loader, Seo, Stack, Text, TextInput } from '@svelteuidev/core';
	import axios, { AxiosError } from 'axios';
	import type { editor } from 'monaco-editor';
	import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
	import CSSWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
	import HTMLWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
	import JSONWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
	import TSWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
	import { onMount, tick } from 'svelte';

	axios.defaults.withCredentials = true;

	enum State {
		LOADING,
		AUTHORIZING,
		WORKING,
		ERROR
	}

	let workspaceName = $page.params.name;
	let div: HTMLDivElement | null = null;
	let monacoEditor: editor.IStandaloneCodeEditor | null = null;
	let state: State = State.LOADING;
	let error: any | null = null,
		errorMessage: string | null = null;
	let token: string = '';
	let workspaceDirectory: Directory | null = null;
	let message: string | null = null;

	const models: Map<string, editor.IModel> = new Map();

	onMount(async () => {
		try {
			const workspace = await axios.get<Workspace>(`${BACKEND_URL}/workspace/${workspaceName}`).then((res) => res.data);

			buildEditor(workspace);
		} catch (e: unknown) {
			if (e instanceof AxiosError) {
				console.log(e);
				if (e.response?.status === 401) {
					state = State.AUTHORIZING;
				} else {
					state = State.ERROR;
					error = e;
				}
			} else {
				state = State.ERROR;
				error = e;
			}
		}
	});

	async function buildEditor(workspace: Workspace): Promise<void> {
		// @ts-ignore
		self.MonacoEnvironment = {
			getWorker: function (_: any, label: string) {
				switch (label) {
					case 'json':
						return new JSONWorker();
					case 'css':
					case 'scss':
					case 'less':
						return new CSSWorker();
					case 'html':
					case 'handlebars':
					case 'razor':
						return new HTMLWorker();
					case 'typescript':
					case 'javascript':
						return new TSWorker();
					default:
						return new EditorWorker();
				}
			}
		};

		const workspaceDir = await axios.get<Directory>(`${BACKEND_URL}/index-workspace/${workspace.name}?token=${workspace.token}`).then((res) => res.data);
		workspaceDirectory = workspaceDir;
		const monaco = await import('monaco-editor');

		await buildModels(monaco, workspace, workspaceDir, []);
		console.log(models);

		monaco.languages.typescript.javascriptDefaults.addExtraLib(await axios.get<string>(`${BACKEND_URL}/typedefs`).then((res) => res.data));

		state = State.WORKING;

		tick().then(() => {
			const shadowRoot = div!.attachShadow({ mode: 'open' });
			const innerDiv = document.createElement('div');
			innerDiv.style.height = '100vh';
			shadowRoot.appendChild(innerDiv);

			// transplant styles for monaco editor
			Array.from(document.getElementsByTagName('style')).forEach((elem) => {
				if (elem.innerHTML.includes('Microsoft')) {
					elem.remove();
					innerDiv.appendChild(elem);
				}
			});

			monacoEditor = monaco.editor.create(innerDiv, {
				theme: 'vs-dark',
				model: null,
				suggest: {
					preview: true
				}
			});

			monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
				axios
					.patch(`${BACKEND_URL}/workspace/${workspace.name}${monacoEditor!.getModel()!.uri.path}`, {
						token: token,
						file: monacoEditor!.getValue()
					})
					.then(() => {
						message = 'Saved!';
					})
					.catch((e) => {
						console.log(e);
					});
			});
		});
	}

	async function loadWorkspace(): Promise<void> {
		error = null;
		errorMessage = null;

		try {
			const workspace = await axios.get<Workspace>(`${BACKEND_URL}/workspace/${workspaceName}?token=${token}`).then((res) => res.data);

			await buildEditor(workspace);
		} catch (e: unknown) {
			if (e instanceof AxiosError) {
				console.log(e);
				if (e.response?.status === 401) {
					state = State.AUTHORIZING;
					errorMessage = e.response.data.message;
				} else {
					state = State.ERROR;
					error = e;
				}
			} else {
				state = State.ERROR;
				error = e;
			}
		}
	}

	async function buildModels(monaco: typeof import('monaco-editor'), workspace: Workspace, directory: Directory, prevPath: string[]): Promise<void> {
		await Promise.all(
			directory.files.map(async (file) => {
				const path = directory.name === workspace.name ? file : [...prevPath, directory.name, file].join('/');
				const contents = await axios
					.get<string>(`${BACKEND_URL}/workspace/${workspace.name}/${path}?token=${workspace.token}`)
					.then((res) => res.data);

				const model = monaco.editor.createModel(contents, undefined, monaco.Uri.file(file));

				models.set(path, model);
			})
		);

		await Promise.all(
			directory.dirs.map((dir) =>
				buildModels(monaco, workspace, dir, directory.name === workspace.name ? [] : prevPath.concat(...prevPath, directory.name))
			)
		);
	}

	function setModel(model: editor.IModel) {
		if (monacoEditor) {
			monacoEditor.setModel(model);
			currentModel.set(model);
		} else {
			console.trace('Tried to set model without editor built');
		}
	}

	function getModel(fileName: string): editor.IModel {
		return models.get(fileName)!;
	}
</script>

<Seo title={`${workspaceName} Workspace | PubDev`} />
<AppShell override={{ main: { paddingLeft: '0 !important', paddingBottom: '0 !important', paddingTop: '0 !important' } }}>
	<Stack justify="start" spacing={4} override={{ width: 256 + 20 * 2, paddingTop: '$lgPX' }} slot="navbar">
		{#if state === State.WORKING}
			{#if workspaceDirectory !== null && workspaceDirectory.dirs.length > 0}
				{#each workspaceDirectory.dirs as dir}
					<DirectoryElement {dir} {getModel} {setModel} />
				{/each}
			{/if}
			{#if workspaceDirectory !== null && workspaceDirectory.files.length > 0}
				{#each workspaceDirectory.files as file}
					<FileElement {file} model={getModel(file)} on:click={(model) => setModel(model.detail)} />
				{/each}
			{/if}
		{/if}
	</Stack>
	<slot>
		{#if state === State.LOADING}
			<Container>
				<Loader />
			</Container>
		{:else if state === State.AUTHORIZING}
			<Container>
				<Stack>
					<TextInput placeholder="Your workspace token" label="Workspace Token" autocomplete="off" bind:value={token} />
					<Container size="sm">
						<Button ripple on:click={loadWorkspace} size="lg" />
					</Container>
					{#if errorMessage}
						<Text color="red">{errorMessage}</Text>
					{:else if error}
						<Text color="red">{error.message}</Text>
					{/if}
				</Stack>
			</Container>
		{:else if state === State.ERROR}
			<Container>
				<Text color="red">{error.message}</Text>
			</Container>
		{:else}
			<div id="container" bind:this={div} />
		{/if}
	</slot>
</AppShell>

<style>
	#container {
		height: 100vh;
	}
</style>
