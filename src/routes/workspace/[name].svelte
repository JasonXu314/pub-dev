<script lang="ts">
	import { page } from '$app/stores';
	import DirectoryElement from '$lib/components/DirectoryElement.svelte';
	import EditorTab from '$lib/components/EditorTab.svelte';
	import FileElement from '$lib/components/FileElement.svelte';
	import FileUpload from '$lib/components/FileUpload.svelte';
	import { Editor } from '$lib/editor';
	import { VIEW_URL } from '$lib/env';
	import { Client } from '$lib/http';
	import { currentModel } from '$lib/stores';
	import { _portal } from '$lib/utils';
	import { AppShell, Box, Button, Container, Group, Loader, Overlay, Paper, Seo, SimpleGrid, Space, Stack, Text, TextInput } from '@svelteuidev/core';
	import { AxiosError } from 'axios';
	import JSZip from 'jszip';
	import type { editor } from 'monaco-editor';
	import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
	import CSSWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
	import HTMLWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
	import JSONWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
	import TSWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
	import { ClipboardCopy, Download, ExternalLink } from 'radix-icons-svelte';
	import { onMount, tick } from 'svelte';

	enum State {
		LOADING,
		AUTHORIZING,
		WORKING,
		ERROR
	}

	enum CreateFileMode {
		CREATE,
		UPLOAD,
		MULTI_UPLOAD
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
		currentFileViewPath: string = '',
		client = new Client(workspaceName),
		editor = new Editor(workspaceName, client);

	const models: Map<string, FileModel> = new Map();

	const SIDEBAR_WIDTH = 256 + 20 * 2;

	onMount(async () => {
		try {
			const workspace = await client.getWorkspace();

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

		editor.build(async () => {
			await tick();

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

			return innerDiv;
		});

		state = State.WORKING;

		editor
			.onSave(() => {
				message = 'Saved!';
			})
			.onWorkspaceChange((workspace) => {
				workspaceDirectory = workspace;
			})
			.onOpenTabsChange((tabs) => {
				tabModels = tabs;
			});
	}

	async function loadWorkspace(): Promise<void> {
		error = null;
		errorMessage = null;
		client.useToken(token);

		try {
			const workspace = await client.getWorkspace();

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

	function setModel(model: FileModel | null) {
		editor.setModel(model);
	}

	function getModel(fileName: string): FileModel {
		return editor.getModel(fileName);
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
		editor.closeTab(model);
	}

	function resetCreationModal(): void {
		createFileDirectory = null;
		fileOrDirName = '';
		createFileMode = null;
		createDirDirectory = null;
		createDirMode = null;
	}

	function handleFileUpload(evt: CustomEvent<File | File[]>): void {
		const files = evt.detail as File[];

		if (files.length > 1) {
			multiCreateFile(files);
		} else {
			createFile(files[0]);
		}
	}

	async function createFile(file?: File): Promise<void> {
		try {
			await editor.createFile(createFileDirectory!, file ? file : fileOrDirName);

			resetCreationModal();
		} catch (e) {
			console.log(e);
			if (e instanceof AxiosError) {
				message = e.response?.data.message || null;
			}
		}
	}

	async function multiCreateFile(fileOrFiles: File | File[]): Promise<void> {
		try {
			await editor.multiCreateFile(createFileDirectory!, fileOrFiles);

			resetCreationModal();
		} catch (e) {
			console.log(e);
			if (e instanceof AxiosError) {
				message = e.response?.data.message || null;
			}
		}
	}

	async function createDirectory(): Promise<void> {
		try {
			await client.mkdir(createDirDirectory!, fileOrDirName);

			const _dirDir = { ...workspaceDirectory! };
			let dirDir = _dirDir;

			createDirDirectory!.split('/').forEach((dir) => {
				dirDir = dirDir.dirs.find((d) => d.name === dir)!;
			});

			dirDir.dirs.push({ name: fileOrDirName, dirs: [], files: [] });
			workspaceDirectory = _dirDir;

			resetCreationModal();
		} catch (e) {
			console.log(e);
			if (e instanceof AxiosError) {
				message = e.response?.data.message || null;
			}
		}
	}

	function downloadProject(): void {
		const zip = new JSZip();

		function addDir(dir: Directory, prevPath: string[]): void {
			dir.dirs.forEach((d) => addDir(d, prevPath.concat(dir.name)));
			dir.files.forEach((f) => {
				const filePath = prevPath.concat(dir.name, f).join('/');

				zip.file(filePath, getModel(filePath).model.getValue());
			});
		}

		workspaceDirectory!.dirs.forEach((d) => addDir(d, []));

		zip.generateAsync({ type: 'blob' }).then((file) => {
			const a = document.createElement('a');
			a.href = URL.createObjectURL(file);
			a.download = `${workspaceName}.zip`;
			a.click();
		});
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
	<Stack justify="start" spacing={0} override={{ width: SIDEBAR_WIDTH, paddingTop: '$xsPX' }} slot="navbar">
		{#if state === State.WORKING}
			<Button compact on:click={downloadProject} override={{ marginLeft: '$smPX', marginRight: '$smPX' }}>
				Export Project to ZIP
				<Download slot="leftIcon" />
			</Button>
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
						<Button ripple on:click={loadWorkspace} size="lg">Submit Token</Button>
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
	<Overlay zIndex={100} use={[_portal]} on:click={resetCreationModal} />
	<Box root="div" css={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 200 }} use={[_portal]}>
		<Container size="sm">
			<Paper>
				{#if createFileMode === null}
					<SimpleGrid cols={2}>
						<Button ripple size="xl" on:click={() => (createFileMode = CreateFileMode.CREATE)}>Create New File</Button>
						<Button ripple size="xl" on:click={() => (createFileMode = CreateFileMode.UPLOAD)}>Upload File(s)</Button>
						<Button ripple size="xl" on:click={() => (createFileMode = CreateFileMode.MULTI_UPLOAD)}>Upload Zipped Files</Button>
					</SimpleGrid>
				{:else if createFileMode === CreateFileMode.CREATE}
					<TextInput placeholder="File Name" required autocomplete="off" label="File Name" bind:value={fileOrDirName} />
					<Space h="md" />
					<Button ripple on:click={() => createFile()}>Create File</Button>
				{:else if createFileMode === CreateFileMode.UPLOAD}
					<FileUpload multiple on:upload={handleFileUpload} />
				{:else}
					<FileUpload on:upload={(evt) => multiCreateFile(evt.detail)} />
				{/if}
			</Paper>
		</Container>
	</Box>
{:else if createDirDirectory}
	<Overlay zIndex={100} use={[_portal]} on:click={resetCreationModal} />
	<Box root="div" css={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 200 }} use={[_portal]}>
		<Container size="sm">
			<Paper>
				{#if createDirMode === null}
					<SimpleGrid cols={2}>
						<Button ripple size="xl" on:click={() => (createDirMode = CreateDirMode.CREATE)}>Create New Folder</Button>
						<Button ripple size="xl" on:click={() => (createDirMode = CreateDirMode.UPLOAD)}>Upload Zipped Folder</Button>
					</SimpleGrid>
				{:else if createDirMode === CreateDirMode.CREATE}
					<TextInput placeholder="Folder Name" required autocomplete="off" label="File Name" bind:value={fileOrDirName} />
					<Space h="md" />
					<Button ripple on:click={createDirectory}>Create Directory</Button>
				{:else}
					<Text>Upload Zipped Folder</Text>
				{/if}
			</Paper>
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
