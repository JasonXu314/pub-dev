<script lang="ts">
	import { page } from '$app/stores';
	import ContextMenu from '$lib/components/ContextMenu.svelte';
	import DirectoryElement from '$lib/components/DirectoryElement.svelte';
	import EditorTab from '$lib/components/EditorTab.svelte';
	import FileElement from '$lib/components/FileElement.svelte';
	import FileUpload from '$lib/components/FileUpload.svelte';
	import StarterStory from '$lib/components/StarterStory.svelte';
	import { Editor } from '$lib/editor';
	import { VIEW_URL } from '$lib/env';
	import { Client } from '$lib/http';
	import { currentModel } from '$lib/stores';
	import { normalizeName, StarterStoryPhase, _focus, _portal } from '$lib/utils';
	import { AppShell, Button, Code, Container, Group, Loader, Modal, Notification, Seo, SimpleGrid, Space, Stack, Text, TextInput } from '@svelteuidev/core';
	import { AxiosError } from 'axios';
	import { Check, ClipboardCopy, Cross2, Download, ExternalLink } from 'radix-icons-svelte';
	import { onDestroy, onMount, tick } from 'svelte';

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
		state: State = State.LOADING,
		error: any | null = null,
		errorMessage: string | null = null,
		token: string = '',
		workspace: Directory | null = null,
		message: string | null = null,
		tabModels: FileModel[] = [],
		createFileDirectory: string | null = null,
		createDirDirectory: string | null = null,
		createFileMode: CreateFileMode | null = null,
		createDirMode: CreateDirMode | null = null,
		fileOrDirName: string = '',
		currentFileViewPath: string = '',
		client = new Client(workspaceName),
		editor = new Editor(workspaceName, client),
		showMenu: boolean = false,
		menuX: number | null = null,
		menuY: number | null = null,
		menuType: 'file' | 'directory' | null = null,
		appShell: AppShell,
		contextPath: string | null = null,
		renaming: boolean = false,
		firstTime: boolean = false,
		starterStoryPhase: StarterStoryPhase | null = null,
		fsDiv: HTMLDivElement,
		viewPageButton: HTMLButtonElement,
		fsStack: HTMLElement,
		createFileButton: HTMLButtonElement,
		createButton: HTMLButtonElement;

	const SIDEBAR_WIDTH = 256 + 20 * 2;

	onMount(async () => {
		const appElem = appShell.$$.root.children[0].children[0];

		appElem.addEventListener('click', () => {
			if (showMenu) {
				showMenu = false;
				menuType = null;
				menuX = null;
				menuY = null;
			}
		});

		const lsStarterStory = localStorage.getItem('pub-dev:starterStory');
		firstTime = lsStarterStory === null;
		starterStoryPhase = lsStarterStory !== null ? parseInt(lsStarterStory) : null;

		try {
			await buildEditor();
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
	});

	onDestroy(() => {
		editor.dispose();
	});

	async function buildEditor(): Promise<void> {
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

				if (starterStoryPhase === StarterStoryPhase.EDIT_PAGE) {
					starterStoryPhase = StarterStoryPhase.VIEW_PAGE;
				}
				if (starterStoryPhase === StarterStoryPhase.POPULATE_PAGE) {
					starterStoryPhase = StarterStoryPhase.VIEW_NEW_PAGE;
				}
			})
			.onWorkspaceChange((ws) => (workspace = ws))
			.onOpenTabsChange((tabs) => (tabModels = tabs));
	}

	async function loadWorkspace(): Promise<void> {
		error = null;
		errorMessage = null;
		client.useToken(token);

		try {
			await buildEditor();
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

	$: {
		if (starterStoryPhase !== null) {
			localStorage.setItem('pub-dev:starterStory', starterStoryPhase.toString());
		}
	}

	function getModelDisplayName(model: FileModel): string {
		return model.path.split('/').at(-1)!;
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
		} catch (e) {
			console.log(e);
			if (e instanceof AxiosError) {
				errorMessage = e.response?.data.message || null;
			}
		} finally {
			resetCreationModal();
		}
	}

	async function multiCreateFile(fileOrFiles: File | File[]): Promise<void> {
		try {
			await editor.multiCreateFile(createFileDirectory!, fileOrFiles);
		} catch (e) {
			console.log(e);
			if (e instanceof AxiosError) {
				errorMessage = e.response?.data.message || null;
			}
		} finally {
			resetCreationModal();
		}
	}

	async function createDirectory(): Promise<void> {
		try {
			await editor.createDirectory(createDirDirectory!, fileOrDirName);
		} catch (e) {
			console.log(e);
			if (e instanceof AxiosError) {
				errorMessage = e.response?.data.message || null;
			}
		} finally {
			resetCreationModal();
		}
	}

	async function uploadDirectory(directory: File | File[]): Promise<void> {
		try {
			await editor.createDirectory(createDirDirectory!, directory as File);
		} catch (e) {
			console.log(e);
			if (e instanceof AxiosError) {
				errorMessage = e.response?.data.message || null;
			}
		} finally {
			resetCreationModal();
		}
	}

	function resetContextMenu(): void {
		menuType = null;
		menuX = null;
		menuY = null;
		menuType = null;
		contextPath = null;
	}

	function resetRename(): void {
		renaming = false;
		fileOrDirName = '';
		resetContextMenu();
	}

	function showContextMenu(evt: ContextEvent): void {
		[menuX, menuY] = evt.pos;
		showMenu = true;
		menuType = evt.type;
		contextPath = evt.path;
	}

	async function deleteFile(): Promise<void> {
		try {
			await editor.delete(contextPath!, menuType!);
		} catch (e) {
			console.log(e);
			if (e instanceof AxiosError) {
				errorMessage = e.response?.data.message || null;
			}
		} finally {
			resetContextMenu();
		}
	}

	function startRename(): void {
		renaming = true;
		fileOrDirName = contextPath!.split('/').at(-1)!;
	}

	async function rename(): Promise<void> {
		if (contextPath!.split('/').at(-1) !== fileOrDirName) {
			try {
				await editor.rename(contextPath!, fileOrDirName, menuType!);
			} catch (e) {
				console.log(e);
				if (e instanceof AxiosError) {
					errorMessage = e.response?.data.message || null;
				}
			} finally {
				resetRename();
			}
		} else {
			resetRename();
		}
	}
</script>

<svelte:head>
	<link rel="stylesheet" type="text/css" href="/font.css" />
</svelte:head>
<Seo title="{workspaceName} Workspace | PubDev" />
<AppShell override={{ main: { paddingLeft: '0 !important', paddingBottom: '0 !important', paddingTop: '0 !important' } }} bind:this={appShell}>
	<Group justify="start" spacing={0} slot="header" override={state === State.WORKING ? { height: '3vh' } : undefined}>
		{#if state === State.WORKING}
			<Group override={{ width: SIDEBAR_WIDTH, paddingLeft: '$mdPX' }}>
				<Button compact on:click={() => navigator.clipboard.writeText(token)}>
					Copy Token
					<ClipboardCopy slot="leftIcon" />
				</Button>
				<Button
					compact
					href="{VIEW_URL.replace('__NAME__', workspaceName)}/{currentFileViewPath}"
					external
					disabled={!$currentModel || $currentModel.model.getLanguageId() !== 'html'}
					bind:element={viewPageButton}
					on:click={starterStoryPhase === StarterStoryPhase.VIEW_PAGE
						? () => (starterStoryPhase = StarterStoryPhase.CREATE_PAGE)
						: starterStoryPhase === StarterStoryPhase.VIEW_NEW_PAGE
						? () => (starterStoryPhase = StarterStoryPhase.TUTORIALS)
						: () => {}}
				>
					Visit Page
					<ExternalLink slot="leftIcon" />
				</Button>
			</Group>
			<Group spacing={0} override={{ height: '100%' }}>
				{#each tabModels as model}
					<EditorTab fileName={getModelDisplayName(model)} on:click={() => editor.setModel(model)} on:close={() => editor.closeTab(model)} />
				{/each}
			</Group>
		{/if}
	</Group>
	<Stack justify="start" spacing={0} override={{ width: SIDEBAR_WIDTH, paddingTop: '$xsPX' }} slot="navbar" bind:element={fsStack}>
		{#if state === State.WORKING}
			<Button compact on:click={() => editor.download()} override={{ marginLeft: '$smPX', marginRight: '$smPX' }}>
				Export Project to ZIP
				<Download slot="leftIcon" />
			</Button>
			{#if workspace !== null && workspace.dirs.length > 0}
				{#each workspace.dirs as directory}
					<DirectoryElement
						{directory}
						prevPath=""
						getModel={(name) => editor.getModel(name)}
						setModel={starterStoryPhase === StarterStoryPhase.SHOW_FILESYSTEM
							? (model) => {
									editor.setModel(model);

									if (model.path === 'routes/index.html') {
										starterStoryPhase = StarterStoryPhase.EDIT_PAGE;
									}
							  }
							: (model) => editor.setModel(model)}
						on:create-file={starterStoryPhase === StarterStoryPhase.CREATE_PAGE
							? (evt) => {
									createFileDirectory = evt.detail;

									if (createFileDirectory.startsWith('routes')) {
										starterStoryPhase = StarterStoryPhase.SELECT_CREATION;
									}
							  }
							: (evt) => (createFileDirectory = evt.detail)}
						on:create-dir={(evt) => (createDirDirectory = evt.detail)}
						on:context={(evt) => showContextMenu(evt.detail)}
					/>
				{/each}
			{/if}
			{#if workspace !== null && workspace.files.length > 0}
				{#each workspace.files as file}
					<FileElement
						{file}
						model={editor.getModel(file)}
						on:click={(evt) => editor.setModel(evt.detail)}
						on:context={(evt) => showContextMenu(evt.detail)}
					/>
				{/each}
			{/if}
			{#if starterStoryPhase === StarterStoryPhase.SHOW_FILESYSTEM || starterStoryPhase === StarterStoryPhase.EDIT_PAGE}
				<div bind:this={fsDiv} />
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
<Modal opened={!!createFileDirectory} centered size="full" on:close={resetCreationModal} title="New File">
	{#if createFileMode === null}
		<Stack>
			<Button
				ripple
				size="xl"
				bind:element={createFileButton}
				on:click={starterStoryPhase === StarterStoryPhase.SELECT_CREATION
					? () => {
							createFileMode = CreateFileMode.CREATE;
							starterStoryPhase = StarterStoryPhase.NAME_FILE;
					  }
					: () => (createFileMode = CreateFileMode.CREATE)}
			>
				Create New File
			</Button>
			<Button ripple size="xl" on:click={() => (createFileMode = CreateFileMode.UPLOAD)}>Upload File(s)</Button>
			<Button ripple size="xl" on:click={() => (createFileMode = CreateFileMode.MULTI_UPLOAD)}>Upload Zipped Files</Button>
		</Stack>
	{:else if createFileMode === CreateFileMode.CREATE}
		{@const isRoute = createFileDirectory?.startsWith('routes/')}
		{@const normalizedName = normalizeName(fileOrDirName)}
		<TextInput placeholder="File Name" required use={[_focus]} autocomplete="off" label="File Name" bind:value={fileOrDirName} />
		{#if fileOrDirName.includes('/')}
			<Space h="xs" />
			<Text color="red">Your file should not be nested inside a folder. In order to create nested files, create the folder first!</Text>
		{:else if isRoute && normalizedName !== fileOrDirName}
			<Space h="xs" />
			<Text>Your file will be created as <Code>{normalizeName(fileOrDirName)}</Code></Text>
		{/if}
		<Space h="md" />
		<Button
			disabled={fileOrDirName.includes('/')}
			ripple
			on:click={starterStoryPhase === StarterStoryPhase.NAME_FILE
				? () => {
						const fileName = fileOrDirName;
						createFile().then(() => {
							editor.setModel(editor.getModel(`routes/${fileName}`));
							starterStoryPhase = StarterStoryPhase.POPULATE_PAGE;
						});
				  }
				: () => createFile()}
			bind:element={createButton}>Create File</Button
		>
	{:else if createFileMode === CreateFileMode.UPLOAD}
		<FileUpload multiple on:upload={handleFileUpload} />
	{:else}
		<FileUpload on:upload={(evt) => multiCreateFile(evt.detail)} />
	{/if}
</Modal>
<Modal opened={!!createDirDirectory} centered size="full" on:close={resetCreationModal} title="New Folder">
	{#if createDirMode === null}
		<SimpleGrid cols={2}>
			<Button ripple size="xl" on:click={() => (createDirMode = CreateDirMode.CREATE)}>Create New Folder</Button>
			<Button ripple size="xl" on:click={() => (createDirMode = CreateDirMode.UPLOAD)}>Upload Zipped Folder</Button>
		</SimpleGrid>
	{:else if createDirMode === CreateDirMode.CREATE}
		{@const isRoute = createDirDirectory?.startsWith('routes/')}
		{@const normalizedName = normalizeName(fileOrDirName)}
		<TextInput placeholder="Folder Name" required use={[_focus]} autocomplete="off" label="File Name" bind:value={fileOrDirName} />
		{#if fileOrDirName.includes('/')}
			<Space h="xs" />
			<Text color="red">Your folder should not be nested inside a folder. In order to create nested folders, create the parent folder first!</Text>
		{:else if isRoute && normalizedName !== fileOrDirName}
			<Space h="xs" />
			<Text>Your folder will be created as <Code>{normalizeName(fileOrDirName)}</Code></Text>
		{/if}
		<Space h="md" />
		<Button disabled={fileOrDirName.includes('/')} ripple on:click={createDirectory}>Create Directory</Button>
	{:else}
		<FileUpload on:upload={(evt) => uploadDirectory(evt.detail)} />
	{/if}
</Modal>
<Modal opened={renaming} centered size="full" title="Rename {menuType === 'directory' ? 'Folder' : 'File'}" on:close={resetRename}>
	<TextInput
		placeholder="{menuType === 'directory' ? 'Folder' : 'File'} Name"
		required
		use={[_focus]}
		autocomplete="off"
		label="{menuType === 'directory' ? 'Folder' : 'File'} Name"
		bind:value={fileOrDirName}
	/>
	<Space h="md" />
	<Button ripple on:click={rename}>Rename</Button>
</Modal>
{#if firstTime}
	<Modal opened={firstTime} size="full" title="Looks like it's your first time here!" on:close={() => (firstTime = false)}>
		<Text>Would you like to take a tutorial on how to use PubDev?</Text>
		<Space h="md" />
		<Group>
			<Button
				ripple
				variant="white"
				on:click={() => {
					firstTime = false;
					starterStoryPhase = StarterStoryPhase.COMPLETED;
				}}>No, thanks</Button
			>
			<Button
				ripple
				color="blue"
				on:click={() => {
					firstTime = false;
					starterStoryPhase = StarterStoryPhase.SHOW_FILESYSTEM;
				}}>Yes!</Button
			>
		</Group>
	</Modal>
{/if}
{#if message}
	<Notification
		color="green"
		use={[_portal]}
		icon={Check}
		override={{ position: 'absolute', top: '$mdPX', right: '$mdPX' }}
		on:close={() => (message = null)}
	>
		{message}
	</Notification>
{/if}
{#if errorMessage}
	<Notification
		color="red"
		use={[_portal]}
		icon={Cross2}
		override={{ position: 'absolute', top: '$mdPX', right: '$mdPX' }}
		on:close={() => (message = null)}
	>
		{errorMessage}
	</Notification>
{/if}
{#if showMenu && menuType !== null && menuX !== null && menuY !== null && contextPath !== null}
	<ContextMenu {menuX} {menuY} {menuType} on:delete={deleteFile} on:rename={startRename} />
{/if}
{#if starterStoryPhase !== null && starterStoryPhase !== StarterStoryPhase.COMPLETED}
	{#key workspace}
		<StarterStory bind:phase={starterStoryPhase} {fsDiv} {viewPageButton} {fsStack} {createFileButton} {createButton} />
	{/key}
{/if}

<style>
	#container {
		height: 97vh;
	}

	:global(.story-arrow) {
		background: white !important;
	}

	/* 
	:global(*) {
		outline: 1px solid lime !important;
	} */
</style>
