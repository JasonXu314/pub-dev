<script lang="ts">
	import FileUpload from '$lib/components/FileUpload.svelte';
	import { BACKEND_URL } from '$lib/env';
	import { normalizeName, _focus, _portal } from '$lib/utils';
	import {
		Anchor,
		Badge,
		Button,
		Card,
		Code as ICode,
		Container,
		Divider,
		Group,
		Overlay,
		Paper,
		Seo,
		SimpleGrid,
		Space,
		Text,
		TextInput,
		Title,
		Tooltip
	} from '@svelteuidev/core';
	import Axios, { AxiosError } from 'axios';
	import JSZip from 'jszip';
	import { Code, ExternalLink, GithubLogo, Share2 } from 'radix-icons-svelte';

	const axios = Axios.create({ withCredentials: true });

	enum CreateProjectMode {
		CREATE,
		UPLOAD,
		IMPORT,
		TEMPLATE
	}

	let creationMode: CreateProjectMode | null = null,
		projectName: string = '',
		creating: boolean = false,
		error: string | null = null,
		newWorkspace: Workspace | null = null;

	function cancel() {
		if (!creating) {
			switch (creationMode) {
				case CreateProjectMode.CREATE:
					projectName = '';
					break;
			}
			creationMode = null;
			newWorkspace = null;
			error = null;
		}
	}

	async function create(): Promise<void> {
		creating = true;
		error = null;

		try {
			newWorkspace = await axios.post<Workspace>(`${BACKEND_URL}/workspace/${normalizeName(projectName)}`).then((res) => res.data);
		} catch (err) {
			if (err instanceof AxiosError) {
				error = err.response?.data.message || 'An unknown server error occured';
			} else if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Unknown error';
				console.error(err);
			}
		} finally {
			creating = false;
		}
	}

	async function upload(f: File | File[]): Promise<void> {
		const file = f as File;

		if (file.type !== 'application/x-zip-compressed') {
			error = 'Invalid file type';
			return;
		} else {
			const projectName = file.name.replace('.zip', '');

			const zip = new JSZip();
			await zip.loadAsync(file);

			const files = Object.values(zip.files);

			if (!files.some((file) => file.dir && (file.name === 'routes/' || file.name === `${projectName}/routes/`))) {
				error =
					'Your project must contain a routes directory or a directory with the same name as your project, containing a routes directory at the root level.';
				return;
			}

			error = null;
			creating = true;

			const data = new FormData();
			data.append('file', file);

			try {
				newWorkspace = await axios.post<Workspace>(`${BACKEND_URL}/workspace/${projectName}`, data).then((res) => res.data);
			} catch (err) {
				if (err instanceof AxiosError) {
					error = err.response?.data.message || 'An unknown server error occured';
				} else if (err instanceof Error) {
					error = err.message;
				} else {
					error = 'Unknown error';
					console.error(err);
				}
			} finally {
				creating = false;
			}
		}
	}
</script>

<Seo title="Project Creation | PubDev" />
<Container>
	<Title>Create a New Project</Title>
	<SimpleGrid cols={2}>
		<Card override={{ border: '1px solid $gray700' }}>
			<Title order={2} override={{ marginTop: '0 !important' }}>Starter Project</Title>
			<Text>Create a barebones starter project with a simple index file and favicon.</Text>
			<Space h="lg" />
			<Button ripple variant="gradient" on:click={() => (creationMode = CreateProjectMode.CREATE)}>
				<Code />
				<Space w="xs" />
				Create
			</Button>
		</Card>
		<Card override={{ border: '1px solid $gray700' }}>
			<Title order={2} override={{ marginTop: '0 !important' }}>Upload Project</Title>
			<Text>Create a project by uploading a ZIP file.</Text>
			<Space h="lg" />
			<Button ripple variant="gradient" on:click={() => (creationMode = CreateProjectMode.UPLOAD)}>
				<Share2 />
				<Space w="xs" />
				Upload
			</Button>
		</Card>
		<Card override={{ border: '1px solid $gray700' }}>
			<Group position="apart">
				<Title order={2} override={{ marginTop: '0 !important' }}>Import From GitHub</Title>
				<Badge color="blue">WIP</Badge>
			</Group>
			<Text>
				Import a project from a
				<Anchor href="https://github.com" external>
					<GithubLogo /> GitHub
				</Anchor>
				repository
			</Text>
			<Space h="lg" />
			<Tooltip label="This feature is WIP!" withArrow arrowSize={3}>
				<Button ripple variant="gradient" disabled>
					<GithubLogo />
					<Space w="xs" />
					Import
				</Button>
			</Tooltip>
		</Card>
		<Card override={{ border: '1px solid $gray700' }}>
			<Group position="apart">
				<Title order={2} override={{ marginTop: '0 !important' }}>Create From Template</Title>
				<Badge color="blue">WIP</Badge>
			</Group>
			<Text>Create a project using a starter template</Text>
			<Space h="lg" />
			<Tooltip label="This feature is WIP!" withArrow arrowSize={3}>
				<Button ripple variant="gradient" disabled>Create</Button>
			</Tooltip>
		</Card>
	</SimpleGrid>
</Container>
{#if creationMode !== null}
	<Overlay zIndex={100} use={[_portal]} on:click={cancel} />
	<Paper
		override={{
			position: 'absolute',
			top: '50%',
			left: '50%',
			transform: 'translate(-50%, -50%)',
			zIndex: 200,
			minWidth: '50%',
			minHeight: '60%'
		}}
		use={[_portal]}
	>
		<Container>
			{#if newWorkspace}
				<Space h="lg" />
				<Title color="green">Your new project has been created!</Title>
				<Space h="md" />
				<Group>
					<Button href="/workspace/{newWorkspace.name}" external>
						Go to Editor
						<ExternalLink slot="leftIcon" />
					</Button>
				</Group>
			{:else if creationMode === CreateProjectMode.CREATE}
				<Title>Create Starter Project</Title>
				<Divider />
				<Space h="lg" />
				<TextInput placeholder="Project Name" required use={[_focus]} autocomplete="off" label="Project Name" bind:value={projectName} />
				{#if normalizeName(projectName) !== projectName}
					<Space h="xs" />
					<Text>Your project will be created as <ICode>{normalizeName(projectName)}</ICode></Text>
				{/if}
				<Space h="md" />
				<Button ripple loading={creating} disabled={creating} on:click={() => create()}>Create Project</Button>
			{:else if creationMode === CreateProjectMode.UPLOAD}
				<Title>Upload Project</Title>
				<Divider />
				<Space h="lg" />
				<FileUpload action="Create" loading={creating} disabled={creating} on:upload={(evt) => upload(evt.detail)} />
			{/if}
			{#if error}
				<Space h="lg" />
				<Text color="red">{error}</Text>
			{/if}
		</Container>
	</Paper>
{/if}
