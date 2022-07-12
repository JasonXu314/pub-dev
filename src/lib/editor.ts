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
