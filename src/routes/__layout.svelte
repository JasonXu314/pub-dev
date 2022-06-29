<script>
	import { SvelteUIProvider, TypographyProvider } from '@svelteuidev/core';
</script>

<SvelteUIProvider withGlobalStyles withNormalizeCSS themeObserver="dark">
	<TypographyProvider>
		<slot />
	</TypographyProvider>
</SvelteUIProvider>
