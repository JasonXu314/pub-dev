<script lang="ts">
	import { Anchor, Button, Center, Group, Stack } from '@svelteuidev/core';
	import { createEventDispatcher } from 'svelte';

	export let multiple: boolean = false;
	export let action: string = 'Upload';
	export let cancel: string = 'Cancel';
	export let disabled: boolean = false;
	export let loading: boolean = false;

	let file: File | null = null,
		files: File[] | null = null,
		fileUpload: HTMLInputElement;

	const dispatch = createEventDispatcher<{ upload: File | File[] }>();

	function uploadSingle() {
		dispatch('upload', file!);
	}

	function uploadMultiple() {
		dispatch('upload', files!);
	}
</script>

<Center>
	{#if !file && !files}
		<Button ripple on:click={() => fileUpload.click()} size="xl">Upload File</Button>
	{/if}
	{#if file}
		<Stack>
			<Center>
				<Anchor href={URL.createObjectURL(file)} external>{file.name}</Anchor>
			</Center>
			<Group>
				<Button {disabled} {loading} ripple on:click={uploadSingle}>{action}</Button>
				<Button {disabled} {loading} ripple on:click={() => (file = null)}>{cancel}</Button>
			</Group>
		</Stack>
	{/if}

	{#if files}
		<Stack>
			{#each files as file}
				<Center>
					<Anchor href={URL.createObjectURL(file)} external>{file.name}</Anchor>
				</Center>
			{/each}
			<Group>
				<Button ripple on:click={uploadMultiple}>Upload</Button>
				<Button ripple on:click={() => (files = null)}>Cancel</Button>
			</Group>
		</Stack>
	{/if}

	<input
		type="file"
		{multiple}
		bind:this={fileUpload}
		on:change={() => {
			if (multiple) {
				files = fileUpload.files ? Array.from(fileUpload.files) : null;
			} else {
				file = fileUpload.files ? fileUpload.files[0] : null;
			}
		}}
	/>
</Center>

<style>
	input {
		display: none;
	}
</style>
