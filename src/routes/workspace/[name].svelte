<script lang="ts">
	import { page } from '$app/stores';
	import DirectoryElement from '$lib/components/DirectoryElement.svelte';
	import EditorTab from '$lib/components/EditorTab.svelte';
	import FileElement from '$lib/components/FileElement.svelte';
	import { BACKEND_URL, VIEW_URL } from '$lib/env';
	import { currentModel } from '$lib/stores';
	import { _portal } from '$lib/utils';
	import { AppShell, Box, Button, Container, Group, Loader, Overlay, Paper, Seo, SimpleGrid, Space, Stack, Text, TextInput } from '@svelteuidev/core';
	import axios, { AxiosError } from 'axios';
	import Cookies from 'js-cookie';
	import type { editor } from 'monaco-editor';
	import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
	import CSSWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
	import HTMLWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
	import JSONWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
	import TSWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
	import { ClipboardCopy, ExternalLink } from 'radix-icons-svelte';
	import { onMount, tick } from 'svelte';

	axios.defaults.withCredentials = true;

	enum State {
		LOADING,
		AUTHORIZING,
		WORKING,
		ERROR
	}

	enum CreateFileMode {
		CREATE,
		UPLOAD
	}

	enum CreateDirMode {
		CREATE,
		UPLOAD
	}

	let workspaceName = $page.params.name,
		div: HTMLDivElement | null = null,
		monacoEditor: editor.IStandaloneCodeEditor | null = null,
		state: State = State.LOADING,
		error: any | null = null,
		errorMessage: string | null = null,
		token: string = '',
		workspaceDirectory: Directory | null = null,
		message: string | null = null,
		tabModels: FileModel[] = [],
		createFileDirectory: string | null = null,
		createDirDirectory: string | null = null,
		createFileMode: CreateFileMode | null = null,
		createDirMode: CreateDirMode | null = null,
		fileOrDirName: string = '',
		monaco: typeof import('monaco-editor') | null = null,
		currentFileViewPath: string = '';

	const models: Map<string, FileModel> = new Map();

	const SIDEBAR_WIDTH = 256 + 20 * 2;

	onMount(async () => {
		if (Cookies.get(`token:${workspaceName}`)) {
			token = Cookies.get(`token:${workspaceName}`)!;
		}

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
		const _monaco = await import('monaco-editor');
		monaco = _monaco;

		await buildModels(_monaco, workspace, workspaceDir, []);
		console.log(models);

		_monaco.languages.typescript.javascriptDefaults.addExtraLib(await axios.get<string>(`${BACKEND_URL}/typedefs`).then((res) => res.data));

		state = State.WORKING;

		tick().then(() => {
			const shadowRoot = div!.attachShadow({ mode: 'open' });
			const innerDiv = document.createElement('div');
			innerDiv.style.height = '95vh';
			shadowRoot.appendChild(innerDiv);

			// transplant styles for monaco editor
			Array.from(document.getElementsByTagName('style')).forEach((elem) => {
				if (elem.innerHTML.includes('Microsoft')) {
					elem.remove();
					innerDiv.appendChild(elem);
				}
			});

			monacoEditor = _monaco.editor.create(innerDiv, {
				theme: 'vs-dark',
				model: null,
				suggest: {
					preview: true
				}
			});

			monacoEditor.addCommand(_monaco.KeyMod.CtrlCmd | _monaco.KeyCode.KeyS, () => {
				if ($currentModel) {
					const data = new FormData();
					data.append('token', token);
					data.append('file', new File([monacoEditor!.getValue()], getModelDisplayName($currentModel)));

					axios
						.patch(`${BACKEND_URL}/workspace/${workspace.name}/${$currentModel.path}`, data)
						.then(() => {
							message = 'Saved!';
						})
						.catch((e) => {
							console.log(e);
						});
				}
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

	// TODO: use global monaco instead of parameter
	async function buildModels(monaco: typeof import('monaco-editor'), workspace: Workspace, directory: Directory, prevPath: string[]): Promise<void> {
		await Promise.all(
			directory.files.map(async (file) => {
				const path = directory === workspaceDirectory ? file : [...prevPath, directory.name, file].join('/');
				const contents = await axios
					.get<string>(`${BACKEND_URL}/workspace/${workspace.name}/${path}?token=${workspace.token}`)
					.then((res) => res.data);

				const model = monaco.editor.createModel(contents, undefined, monaco.Uri.file(path));

				models.set(path, { model, path });
			})
		);

		await Promise.all(
			directory.dirs.map((dir) => buildModels(monaco, workspace, dir, directory === workspaceDirectory ? [] : prevPath.concat(directory.name)))
		);
	}

	function setModel(model: FileModel | null) {
		if (monacoEditor) {
			if (model) {
				monacoEditor.setModel(model.model);
				currentModel.set(model);

				if (!tabModels.includes(model)) {
					tabModels = [...tabModels, model];
				}
			} else {
				monacoEditor.setModel(null);
				currentModel.set(null);
			}
		} else {
			console.trace('Tried to set model without editor built');
		}
	}

	function getModel(fileName: string): FileModel {
		console.log(fileName);
		return models.get(fileName)!;
	}

	$: {
		const path = $currentModel?.path;

		if (!path) {
			currentFileViewPath = '';
		} else {
			if (path.startsWith('routes/')) {
				currentFileViewPath = path.replace('routes/', '').split('.').slice(0, -1).join('.');
			} else {
				currentFileViewPath = path.replace('public/', '');
			}
		}
	}

	function getModelDisplayName(model: FileModel): string {
		return model.path.split('/').at(-1)!;
	}

	function closeTab(model: FileModel): void {
		if ($currentModel === model) {
			setModel(null);
		}

		tabModels = tabModels.filter((m) => m !== model);
	}

	async function createFile(): Promise<void> {
		const path = `${createFileDirectory}/${fileOrDirName}`;

		try {
			await axios.post(`${BACKEND_URL}/workspace/${workspaceName}/${path}`, { token, type: 'file' });

			const contents = await axios.get<string>(`${BACKEND_URL}/workspace/${workspaceName}/${path}?token=${token}`).then((res) => res.data);

			const model = monaco!.editor.createModel(contents, undefined, monaco!.Uri.file(path));

			models.set(path, { model, path });

			const _fileDir = { ...workspaceDirectory! };
			let fileDir = _fileDir;

			createFileDirectory!.split('/').forEach((dir) => {
				fileDir = fileDir.dirs.find((d) => d.name === dir)!;
			});

			fileDir.files.push(fileOrDirName);
			workspaceDirectory = _fileDir;

			createFileDirectory = null;
			fileOrDirName = '';
			createFileMode = null;
		} catch (e) {
			console.log(e);
			if (e instanceof AxiosError) {
				message = e.response?.data.message || null;
			}
		}
	}

	async function createDirectory(): Promise<void> {
		const path = `${createDirDirectory}/${fileOrDirName}`;

		try {
			await axios.post(`${BACKEND_URL}/workspace/${workspaceName}/${path}`, { token, type: 'directory' });

			const _dirDir = { ...workspaceDirectory! };
			let dirDir = _dirDir;

			createDirDirectory!.split('/').forEach((dir) => {
				dirDir = dirDir.dirs.find((d) => d.name === dir)!;
			});

			dirDir.dirs.push({ name: fileOrDirName, dirs: [], files: [] });
			workspaceDirectory = _dirDir;

			createDirDirectory = null;
			fileOrDirName = '';
			createDirMode = null;
		} catch (e) {
			console.log(e);
			if (e instanceof AxiosError) {
				message = e.response?.data.message || null;
			}
		}
	}
</script>

<Seo title={`${workspaceName} Workspace | PubDev`} />
<AppShell override={{ main: { paddingLeft: '0 !important', paddingBottom: '0 !important', paddingTop: '0 !important' } }}>
	<Group justify="start" spacing={0} slot="header" override={state === State.WORKING ? { height: '3vh' } : undefined}>
		{#if state === State.WORKING}
			<Group override={{ width: SIDEBAR_WIDTH, paddingLeft: '$mdPX' }}>
				<Button compact on:click={() => navigator.clipboard.writeText(token)}
					>Copy Token
					<ClipboardCopy slot="leftIcon" />
				</Button>
				<Button
					compact
					href={`${VIEW_URL.replace('__NAME__', workspaceName)}/${currentFileViewPath}`}
					external
					disabled={!$currentModel || $currentModel.model.getLanguageId() !== 'html'}
					>Visit Page
					<ExternalLink slot="leftIcon" />
				</Button>
			</Group>
			<Group spacing={0} override={{ height: '100%' }}>
				{#each tabModels as model}
					<EditorTab fileName={getModelDisplayName(model)} on:click={() => setModel(model)} on:close={() => closeTab(model)} />
				{/each}
			</Group>
		{/if}
	</Group>
	<Stack justify="start" spacing={0} override={{ width: SIDEBAR_WIDTH }} slot="navbar">
		{#if state === State.WORKING}
			{#if workspaceDirectory !== null && workspaceDirectory.dirs.length > 0}
				{#each workspaceDirectory.dirs as directory}
					<DirectoryElement
						{directory}
						prevPath=""
						{getModel}
						{setModel}
						on:create-file={(evt) => (createFileDirectory = evt.detail)}
						on:create-dir={(evt) => (createDirDirectory = evt.detail)}
					/>
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
{#if createFileDirectory}
	<Overlay zIndex={100} use={[_portal]} />
	<Box root="div" css={{ position: 'absolute', top: 0, width: '100%', height: '100%', zIndex: 200 }} use={[_portal]}>
		<Container override={{ height: '100%' }} size="sm">
			<Stack override={{ height: '100%' }} justify="space-around">
				<Paper>
					{#if createFileMode === null}
						<SimpleGrid cols={2}>
							<Button size="xl" ripple on:click={() => (createFileMode = CreateFileMode.CREATE)}>Create New File</Button>
							<Button size="xl" ripple on:click={() => (createFileMode = CreateFileMode.UPLOAD)}>Upload File(s)</Button>
							<Button size="xl" ripple on:click={() => (createFileMode = CreateFileMode.UPLOAD)}>Upload Zipped Files</Button>
						</SimpleGrid>
					{:else if createFileMode === CreateFileMode.CREATE}
						<TextInput placeholder="File Name" required autocomplete="off" label="File Name" bind:value={fileOrDirName} />
						<Space h="md" />
						<Button ripple on:click={createFile}>Create File</Button>
					{:else}
						<Text>Upload File</Text>
					{/if}
				</Paper>
			</Stack>
		</Container>
	</Box>
{:else if createDirDirectory}
	<Overlay zIndex={100} use={[_portal]} />
	<Box root="div" css={{ position: 'absolute', top: 0, width: '100%', height: '100%', zIndex: 200 }} use={[_portal]}>
		<Container override={{ height: '100%' }} size="sm">
			<Stack override={{ height: '100%' }} justify="space-around">
				<Paper>
					{#if createDirMode === null}
						<SimpleGrid cols={2}>
							<Button size="xl" ripple on:click={() => (createDirMode = CreateDirMode.CREATE)}>Create New Folder</Button>
							<Button size="xl" ripple on:click={() => (createDirMode = CreateDirMode.UPLOAD)}>Upload Zipped Folder</Button>
						</SimpleGrid>
					{:else if createDirMode === CreateDirMode.CREATE}
						<TextInput placeholder="Folder Name" required autocomplete="off" label="File Name" bind:value={fileOrDirName} />
						<Space h="md" />
						<Button ripple on:click={createDirectory}>Create Directory</Button>
					{:else}
						<Text>Upload Zipped Folder</Text>
					{/if}
				</Paper>
			</Stack>
		</Container>
	</Box>
{/if}

<style>
	#container {
		height: 97vh;
	}

	/* 
	:global(*) {
		outline: 1px solid lime !important;
	} */
</style>
