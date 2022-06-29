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
