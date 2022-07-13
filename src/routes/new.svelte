<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import FileUpload from '$lib/components/FileUpload.svelte';
	import { _portal } from '$lib/utils';
	import { Anchor, Button, Container, Divider, Overlay, Paper, SimpleGrid, Space, Text, TextInput, Title, Tooltip } from '@svelteuidev/core';
	import Axios from 'axios';
	import { GithubLogo } from 'radix-icons-svelte';

	const axios = Axios.create({ withCredentials: true });

	enum CreateProjectMode {
		CREATE,
		UPLOAD,
		IMPORT,
		TEMPLATE
	}

	let creationMode: CreateProjectMode | null = null,
		projectName: string = '',
		creating: boolean = false;

	function cancel() {
		if (!creating) {
			switch (creationMode) {
				case CreateProjectMode.CREATE:
					projectName = '';
					break;
			}
			creationMode = null;
		}
	}

	async function upload(file: File | File[]) {}
</script>

<Container>
	<Title>Create a New Project</Title>
	<SimpleGrid cols={4}>
		<Card title="Starter Project">
			<Text>Create a starter project with a simple index file and favicon.</Text>
			<Button variant="gradient" slot="actions" on:click={() => (creationMode = CreateProjectMode.CREATE)}>Create</Button>
		</Card>
		<Card title="Upload Project">
			<Text>Create a project by uploading a ZIP file.</Text>
			<Button variant="gradient" slot="actions">Upload</Button>
		</Card>
		<Card title="Import From GitHub" badge="WIP">
			<Text>
				Import a project from a
				<Anchor href="https://github.com" external>
					<GithubLogo /> GitHub
				</Anchor>
				repository
			</Text>
			<Tooltip label="This feature is WIP!" slot="actions" withArrow arrowSize={3}>
				<Button variant="gradient" disabled>Import</Button>
			</Tooltip>
		</Card>
		<Card title="Upload Project" badge="WIP">
			<Text>Create a project using a starter template</Text>
			<Tooltip label="This feature is WIP!" slot="actions" withArrow arrowSize={3}>
				<Button variant="gradient" disabled>Create</Button>
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
			minWidth: '40%',
			minHeight: '60%'
		}}
		use={[_portal]}
	>
		<Container>
			{#if creationMode === CreateProjectMode.CREATE}
				<Title>Create Starter Project</Title>
				<Divider />
				<Space h="lg" />
				<TextInput placeholder="Project Name" required autocomplete="off" label="Project Name" bind:value={projectName} />
				<Space h="md" />
				<Button
					ripple
					loading={creating}
					on:click={() => {
						console.log(projectName);
						creating = true;
					}}>Create Project</Button
				>
			{:else if creationMode === CreateProjectMode.UPLOAD}
				<FileUpload on:upload={(evt) => upload(evt.detail)} />
			{/if}
		</Container>
	</Paper>
{/if}
