import { portal } from '@svelteuidev/composables';

// svelteui portal is incorrectly typed, so create wrapper
export function _portal(node: HTMLOrSVGElement, target: HTMLElement | string) {
	return portal(node as HTMLElement, target);
}

export function normalizeProjectName(name: string) {
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
