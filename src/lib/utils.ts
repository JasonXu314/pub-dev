import { focus, portal } from '@svelteuidev/composables';
import type { FocusableElement } from '@svelteuidev/composables/types/shared/actions/types';

export enum StarterStoryPhase {
	SHOW_FILESYSTEM,
	EDIT_PAGE,
	VIEW_PAGE,
	CREATE_PAGE,
	SELECT_CREATION,
	NAME_FILE,
	POPULATE_PAGE,
	VIEW_NEW_PAGE,
	TUTORIALS,
	COMPLETED
}

// svelteui portal is incorrectly typed, so create wrapper
export function _portal(node: HTMLOrSVGElement, target: HTMLElement | string) {
	return portal(node as HTMLElement, target);
}

// svelteui focus is incorrectly typed, so create wrapper
export function _focus(node: HTMLOrSVGElement) {
	return focus(node as FocusableElement);
}

export function normalizeName(name: string) {
	return name.replace(/\s+/g, '-').toLowerCase();
}

export function getMIMEType(file: string): string {
	if (file.endsWith('.js')) {
		return 'application/javascript';
	} else if (file.endsWith('.css')) {
		return 'text/css';
	} else if (file.endsWith('.html')) {
		return 'text/html';
	} else if (file.endsWith('.json')) {
		return 'application/json';
	} else if (file.endsWith('.png')) {
		return 'image/png';
	} else if (file.endsWith('.jpg') || file.endsWith('.jpeg')) {
		return 'image/jpeg';
	} else if (file.endsWith('.svg')) {
		return 'image/svg+xml';
	} else if (file.endsWith('.ico')) {
		return 'image/x-icon';
	} else if (file.endsWith('.txt')) {
		return 'text/plain';
	} else if (file.endsWith('.xml')) {
		return 'text/xml';
	} else if (file.endsWith('.pdf')) {
		return 'application/pdf';
	} else if (file.endsWith('.csv')) {
		return 'text/csv';
	} else {
		return 'application/octet-stream';
	}
}
