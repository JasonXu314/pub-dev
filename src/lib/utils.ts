import { portal } from '@svelteuidev/composables';

// svelteui portal is incorrectly typed, so create wrapper
export function _portal(node: HTMLOrSVGElement, target: HTMLElement | string) {
	return portal(node as HTMLElement, target);
}

export function normalizeProjectName(name: string) {
	return name.replace(/\s+/g, '-').toLowerCase();
}
