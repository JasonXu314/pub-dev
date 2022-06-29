import type { editor } from 'monaco-editor';
import { writable, type Writable } from 'svelte/store';

export const currentModel: Writable<editor.IModel | null> = writable(null);
