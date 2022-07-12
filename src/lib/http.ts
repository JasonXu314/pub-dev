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
			await axios.post(`${BACKEND_URL}/workspace/${path}`, { type: 'file' });
		}

		return {
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
							path: `${dir}/${file}`,
							content: await zip.files[file].async('text')
						};
					})
				);
			}
		}
	}

	public async mkdir(dir: string, name: string): Promise<void> {
		const path = `${dir}/${name}`;

		return axios.post(`${BACKEND_URL}/workspace/${path}`, { type: 'directory' });
	}

	public useToken(token: string): void {
		this._token = token;
	}
}
