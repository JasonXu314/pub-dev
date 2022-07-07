import { writable, type Writable } from 'svelte/store';

export const currentModel: Writable<FileModel | null> = writable(null);
