/// <reference types="@sveltejs/kit" />

type Workspace = {
	name: string;
	token: string;
};

type Directory = {
	name: string;
	files: string[];
	dirs: Directory[];
};

type FileModel = {
	path: string;
	model: import('monaco-editor').editor.IModel;
};

type NewFile = {
	name: string;
	path: string;
	content: string;
};

