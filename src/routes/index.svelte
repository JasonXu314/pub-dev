<script lang="ts">
	import FileUpload from '$lib/components/FileUpload.svelte';
	import { AppShell } from '@svelteuidev/core';
</script>

<AppShell>
	<slot>
		<FileUpload />
	</slot>
</AppShell>
