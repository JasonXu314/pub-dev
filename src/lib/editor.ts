import JSZip from 'jszip';
import type { editor } from 'monaco-editor';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import CSSWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import HTMLWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import JSONWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import TSWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import type { Client } from './http';
import { currentModel } from './stores';

export class Editor {
	private _root: HTMLDivElement | null = null;
	private _workspace: Directory | null = null;
	private _monaco: typeof import('monaco-editor') | null = null;
	private _models: Map<string, FileModel> = new Map();
	private _editor: editor.IStandaloneCodeEditor | null = null;
	private _currentModel: FileModel | null = null;
	private _openTabs: FileModel[] = [];

	private _onSave: (() => void) | null = null;
	private _onWorkspaceChange: ((workspace: Directory) => void) | null = null;
	private _onOpenTabsChange: ((tabs: FileModel[]) => void) | null = null;

	constructor(private _name: string, private _client: Client) {
		if (typeof window !== 'undefined') {
			// @ts-ignore
			window.MonacoEnvironment = {
				getWorker: function (_: any, label: string) {
					switch (label) {
						case 'json':
							return new JSONWorker();
						case 'css':
						case 'scss':
						case 'less':
							return new CSSWorker();
						case 'html':
						case 'handlebars':
						case 'razor':
							return new HTMLWorker();
						case 'typescript':
						case 'javascript':
							return new TSWorker();
						default:
							return new EditorWorker();
					}
				}
			};
		}

		currentModel.subscribe((model) => {
			this._currentModel = model;
		});
	}

	public onSave(callback: () => void): this {
		this._onSave = callback;
		return this;
	}

	public onWorkspaceChange(callback: (workspace: Directory) => void): this {
		this._onWorkspaceChange = callback;
		return this;
	}

	public onOpenTabsChange(callback: (tabs: FileModel[]) => void): this {
		this._onOpenTabsChange = callback;
		return this;
	}

	public async build(tick: () => Promise<HTMLDivElement>): Promise<void> {
		this._workspace = await this._client.getFileStructure();
		this._monaco = await import('monaco-editor');

		await this._buildModels(this._workspace, []);
		if (this._onWorkspaceChange) {
			this._onWorkspaceChange({ ...this._workspace });
		}

		this._monaco.languages.typescript.javascriptDefaults.addExtraLib(await this._client.getTypedefs());

		this._root = await tick();

		this._editor = this._monaco.editor.create(this._root, {
			theme: 'vs-dark',
			model: null,
			suggest: {
				preview: true
			}
		});

		this._editor.addCommand(this._monaco.KeyMod.CtrlCmd | this._monaco.KeyCode.KeyS, () => {
			if (this._currentModel) {
				this._client
					.write(this._currentModel.path, this._editor!.getValue())
					.then(() => {
						if (this._onSave) {
							this._onSave();
						}
					})
					.catch((e) => {
						console.log(e);
					});
			}
		});
	}

	public setModel(model: FileModel | null) {
		if (this._editor) {
			if (model) {
				this._editor.setModel(model.model);
				currentModel.set(model);

				if (!this._openTabs.includes(model)) {
					this._openTabs.push(model);
					if (this._onOpenTabsChange) {
						this._onOpenTabsChange([...this._openTabs]);
					}
				}
			} else {
				this._editor.setModel(null);
				currentModel.set(null);
			}
		} else {
			throw new Error('Tried to set model without editor built');
		}
	}

	public getModel(fileName: string): FileModel {
		const model = this._models.get(fileName);

		if (!model) {
			console.log(this._models);
			throw new Error(`Model for ${fileName} not found`);
		}

		return model;
	}

	public closeTab(model: FileModel): void {
		if (this._currentModel === model) {
			this.setModel(null);
		}

		this._openTabs = this._openTabs.filter((m) => m !== model);
		if (this._onOpenTabsChange) {
			this._onOpenTabsChange([...this._openTabs]);
		}
	}

	public async createFile(dir: string, file: File | string): Promise<void> {
		if (typeof file === 'string') {
			const { path, content } = await this._client.touch(dir, file);

			const model = this._monaco!.editor.createModel(content, undefined, this._monaco!.Uri.file(path));

			this._models.set(path, { model, path });

			let fileDir = this._workspace!;

			dir.split('/').forEach((dir) => {
				fileDir = fileDir.dirs.find((d) => d.name === dir)!;
			});

			fileDir.files.push(file);
			if (this._onWorkspaceChange) {
				this._onWorkspaceChange({ ...this._workspace! });
			}
		} else {
			const { path, content } = await this._client.touch(dir, file.name, file);

			const model = this._monaco!.editor.createModel(content, undefined, this._monaco!.Uri.file(path));

			this._models.set(path, { model, path });

			let fileDir = this._workspace!;

			dir.split('/').forEach((dir) => {
				fileDir = fileDir.dirs.find((d) => d.name === dir)!;
			});

			fileDir.files.push(file.name);
			if (this._onWorkspaceChange) {
				this._onWorkspaceChange({ ...this._workspace! });
			}
		}
	}

	public async multiCreateFile(dir: string, fileOrFiles: File | File[]): Promise<void> {
		const newFiles = await this._client.multiTouch(dir, fileOrFiles);

		newFiles.forEach((file) => {
			const model = this._monaco!.editor.createModel(file.content, undefined, this._monaco!.Uri.file(file.path));

			this._models.set(file.path, { model, path: file.path });
		});

		let fileDir = this._workspace!;

		dir.split('/').forEach((dir) => {
			fileDir = fileDir.dirs.find((d) => d.name === dir)!;
		});

		fileDir.files.push(...newFiles.map((f) => f.name));
		if (this._onWorkspaceChange) {
			this._onWorkspaceChange({ ...this._workspace! });
		}
	}

	public async delete(path: string, type: 'file' | 'directory'): Promise<void> {
		await this._client.delete(path, type);

		if (type === 'file') {
			const model = this.getModel(path);

			this._models.delete(path);
			model.model.dispose();

			if (this._currentModel && this._currentModel.path === path) {
				this.setModel(null);
			}

			if (this._openTabs.includes(model)) {
				this._openTabs = this._openTabs.filter((m) => m !== model);

				if (this._onOpenTabsChange) {
					this._onOpenTabsChange([...this._openTabs]);
				}
			}
		}

		let dir = this._workspace!;
		const [end, ...dirs] = path.split('/').reverse();

		dirs.reverse().forEach((pathDir) => {
			dir = dir.dirs.find((d) => d.name === pathDir)!;
		});

		if (type === 'file') {
			dir.files = dir.files.filter((f) => f !== end);
		} else {
			const rmDir = dir.dirs.find((d) => d.name === end)!;
			dir.dirs = dir.dirs.filter((d) => d.name !== end);

			rmDir.files.forEach((f) => {
				const fullPath = `${path}/${f}`,
					model = this.getModel(fullPath);

				this._models.delete(fullPath);
				model.model.dispose();

				if (this._currentModel && this._currentModel.path === fullPath) {
					this.setModel(null);
				}

				if (this._openTabs.includes(model)) {
					this._openTabs = this._openTabs.filter((m) => m !== model);

					if (this._onOpenTabsChange) {
						this._onOpenTabsChange([...this._openTabs]);
					}
				}
			});
		}

		if (this._onWorkspaceChange) {
			this._onWorkspaceChange({ ...this._workspace! });
		}
	}

	public async rename(path: string, name: string, type: 'file' | 'directory'): Promise<void> {
		await this._client.rename(path, name, type);

		if (type === 'file') {
			const model = this.getModel(path);
			const oldMonacoModel = model.model;

			model.path = `${path.split('/').slice(0, -1).join('/')}/${name}`;
			model.model = this._monaco!.editor.createModel(oldMonacoModel.getValue(), undefined, this._monaco!.Uri.file(model.path));
			oldMonacoModel.dispose();

			this._models.delete(path);
			this._models.set(model.path, model);

			if (this._currentModel && this._currentModel.path === path) {
				this.setModel(model);
			}

			if (this._openTabs.includes(model) && this._onOpenTabsChange) {
				this._onOpenTabsChange([...this._openTabs]);
			}
		}

		let dir = this._workspace!;
		const [end, ...dirs] = path.split('/').reverse();

		dirs.reverse().forEach((pathDir) => {
			dir = dir.dirs.find((d) => d.name === pathDir)!;
		});

		if (type === 'file') {
			dir.files = dir.files.filter((f) => f !== end);
			dir.files.push(name);
		} else {
			const renameDir = dir.dirs.find((d) => d.name === end)!;
			renameDir.name = name;

			renameDir.files.forEach((f) => {
				const fullPath = `${path}/${f}`,
					model = this.getModel(fullPath),
					oldMonacoModel = model.model;

				model.path = `${path.split('/').slice(0, -1).join('/')}/${name}/${f}`;
				model.model = this._monaco!.editor.createModel(oldMonacoModel.getValue(), undefined, this._monaco!.Uri.file(model.path));
				oldMonacoModel.dispose();

				this._models.delete(fullPath);
				this._models.set(model.path, model);

				if (this._currentModel && this._currentModel.path === fullPath) {
					this.setModel(null);
				}

				if (this._openTabs.includes(model)) {
					this._openTabs = this._openTabs.filter((m) => m !== model);

					if (this._onOpenTabsChange) {
						this._onOpenTabsChange([...this._openTabs]);
					}
				}
			});
		}

		if (this._onWorkspaceChange) {
			this._onWorkspaceChange({ ...this._workspace! });
		}
	}

	public async createDirectory(dir: string, name: string): Promise<void>;
	public async createDirectory(dir: string, file: File): Promise<void>;
	public async createDirectory(dir: string, nameOrFile: string | File): Promise<void> {
		const newDir = await this._client.mkdir(dir, nameOrFile);

		await this._buildModels(newDir, dir.split('/'));

		let fileDir = this._workspace!;

		dir.split('/').forEach((dir) => {
			fileDir = fileDir.dirs.find((d) => d.name === dir)!;
		});

		fileDir.dirs.push(newDir);
		if (this._onWorkspaceChange) {
			this._onWorkspaceChange({ ...this._workspace! });
		}
	}

	public async download(): Promise<void> {
		const zip = new JSZip();

		const addDir = (dir: Directory, prevPath: string[]): void => {
			dir.dirs.forEach((d) => addDir(d, prevPath.concat(dir.name)));
			dir.files.forEach((f) => {
				const filePath = prevPath.concat(dir.name, f).join('/');

				zip.file(filePath, this.getModel(filePath).model.getValue());
			});
		};

		this._workspace!.dirs.forEach((d) => addDir(d, []));

		zip.generateAsync({ type: 'blob' }).then((file) => {
			const a = document.createElement('a');
			a.href = URL.createObjectURL(file);
			a.download = `${this._name}.zip`;
			a.click();
		});
	}

	private async _buildModels(directory: Directory, prevPath: string[]): Promise<void> {
		await Promise.all(
			directory.files.map(async (file) => {
				const path = directory === this._workspace ? file : [...prevPath, directory.name, file].join('/');
				const contents = await this._client.read(path);

				const model = this._monaco!.editor.createModel(contents, undefined, this._monaco!.Uri.file(path));

				this._models.set(path, { model, path });
			})
		);

		await Promise.all(directory.dirs.map((dir) => this._buildModels(dir, directory === this._workspace ? [] : prevPath.concat(directory.name))));
	}
}
