<script lang="ts">
	import { Paper, Popper, type CSS } from '@svelteuidev/core';

	export let reference: HTMLElement;
	export let position: 'bottom' | 'top' | 'left' | 'right' = 'bottom';
	export let override: CSS = {};
	export let placement: 'start' | 'center' | 'end' = 'start';
</script>

<Popper
	{reference}
	mounted={!!reference}
	withArrow
	arrowSize={8}
	{placement}
	gutter={16}
	{position}
	zIndex={1000}
	override={{ pointerEvents: 'all', ...override }}
	arrowClassName="story-arrow"
	arrowDistance={8}
>
	<Paper override={{ background: '$white !important', color: '$dark400 !important', maxWidth: '33vw' }}>
		<slot />
	</Paper>
</Popper>
