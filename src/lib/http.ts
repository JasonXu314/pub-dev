import axios, { Axios } from 'axios';
import JSZip from 'jszip';
import { BACKEND_URL } from './env';

// TODO: this implementation relies on `getWorkspace` being called before anything else, refactor to make call in constructor
export class Client {
	private _axios: Axios;
	private _token: string | null = null;

	constructor(private _name: string) {
		this._axios = axios.create({
			withCredentials: true
		});
	}

	public async getWorkspace(): Promise<Workspace> {
		if (this._token) {
			return await this._axios.get<Workspace>(`${BACKEND_URL}/workspace/${this._name}?token=${this._token}`).then((res) => res.data);
		} else {
			return this._axios.get<Workspace>(`${BACKEND_URL}/workspace/${this._name}`).then((res) => res.data);
		}
	}

	public async getFileStructure(): Promise<Directory> {
		return this._axios.get<Directory>(`${BACKEND_URL}/index-workspace/${this._name}`).then((res) => res.data);
	}

	public async getTypedefs(): Promise<string> {
		return this._axios.get<string>(`${BACKEND_URL}/typedefs`).then((res) => res.data);
	}

	public async read(path: string): Promise<string> {
		return this._axios.get<string>(`${BACKEND_URL}/workspace/${this._name}/${path}`).then((res) => res.data);
	}

	public async write(path: string, content: string): Promise<void> {
		const data = new FormData();
		data.append('file', new File([content], path.split('/').at(-1)!));

		return this._axios.patch(`${BACKEND_URL}/workspace/${this._name}/${path}`, data);
	}

	public async touch(dir: string, name: string, file?: File): Promise<NewFile> {
		const path = `${dir}/${name}`;

		if (file) {
			const data = new FormData();
			data.append('type', 'file');
			data.append('file', file, name);

			await this._axios.post(`${BACKEND_URL}/workspace/${this._name}/${path}`, data);
		} else {
			await this._axios.post(`${BACKEND_URL}/workspace/${this._name}/${path}`, { type: 'file' });
		}

		return {
			name,
			path,
			content: await this.read(path)
		};
	}

	public async multiTouch(dir: string, fileOrFiles: File | File[]): Promise<NewFile[]> {
		const data = new FormData();

		const zip = new JSZip();

		if (Array.isArray(fileOrFiles)) {
			const newFiles: NewFile[] = await Promise.all(
				fileOrFiles.map(async (file) => {
					zip.file(file.name, file);

					return {
						name: file.name,
						path: `${dir}/${file.name}`,
						content: await file.text()
					};
				})
			);

			data.append('files', await zip.generateAsync({ type: 'blob' }), 'files.zip');

			await this._axios.post(`${BACKEND_URL}/upload-files/${this._name}/${dir}`, data);

			return newFiles;
		} else {
			await zip.loadAsync(fileOrFiles);

			if (Object.keys(zip.files).some((file) => file.includes('/'))) {
				throw new Error('ZIP file should not contain folders; to upload a folder create a new folder and select the "Upload Zipped Folder" option');
			} else {
				data.append('files', fileOrFiles, 'files.zip');

				await this._axios.post(`${BACKEND_URL}/upload-files/${this._name}/${dir}`, data);

				return Promise.all(
					Object.keys(zip.files).map(async (file) => {
						return {
							name: file,
							path: `${dir}/${file}`,
							content: await zip.files[file].async('text')
						};
					})
				);
			}
		}
	}

	public async mkdir(dir: string, nameOrFile: string | File): Promise<Directory> {
		if (typeof nameOrFile === 'string') {
			const name = nameOrFile;
			const path = `${dir}/${name}`;

			await this._axios.post(`${BACKEND_URL}/workspace/${this._name}/${path}`, { type: 'directory' });

			return {
				name,
				dirs: [],
				files: []
			};
		} else {
			const file = nameOrFile,
				name = file.name.split('.').slice(0, -1).join('.'),
				path = `${dir}/${name}`;

			const data = new FormData();
			data.append('type', 'directory');
			data.append('file', file, name);

			await this._axios.post(`${BACKEND_URL}/workspace/${this._name}/${path}`, data);

			const zip = new JSZip();
			await zip.loadAsync(file);

			const directory: Directory = {
				name,
				dirs: [],
				files: []
			};

			Object.keys(zip.files)
				.filter((key) => !zip.files[key].dir)
				.forEach(async (file) => {
					let dir = directory;

					file.split('/')
						.slice(0, -1)
						.forEach((part) => {
							const subdir = dir.dirs.find((d) => d.name === part);

							if (subdir) {
								dir = subdir;
							} else {
								const newDir = {
									name: part,
									dirs: [],
									files: []
								};

								dir.dirs.push(newDir);
								dir = newDir;
							}
						});

					dir.files.push(file.split('/').pop()!);
				});

			return directory;
		}
	}

	public async delete(path: string, type: 'file' | 'directory'): Promise<void> {
		return this._axios.delete(`${BACKEND_URL}/workspace/${this._name}/${path}?type=${type}`);
	}

	public async rename(path: string, newName: string, type: 'file' | 'directory'): Promise<void> {
		return this._axios.post(`${BACKEND_URL}/workspace/${this._name}/${path}`, { action: 'rename', type, newName });
	}

	public useToken(token: string): void {
		this._token = token;
	}
}
