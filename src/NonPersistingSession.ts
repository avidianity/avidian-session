export class NonPersistingSession {
	key: string;
	Storage: typeof window.sessionStorage;

	constructor(key?: string) {
		this.key = key ? `non-persisting-${key}` : 'non-persisting-session-key';
		this.Storage = window.sessionStorage;
	}

	get(key: string): any {
		return this.has(key) ? (this.getAll() as any)[key] : null;
	}

	private getAll(): object {
		try {
			return JSON.parse(this.Storage.getItem(this.key) || '');
		} catch (error) {
			return {};
		}
	}

	set(key: string, value: any): this {
		const data = this.getAll() as any;
		data[key] = value;
		return this.setAll(data);
	}

	private setAll(data: object): this {
		this.Storage.setItem(this.key, JSON.stringify(data));
		return this;
	}

	remove(key: string): this {
		const data = this.getAll() as any;
		delete data[key];
		return this.setAll(data);
	}

	clear(): this {
		return this.setAll({});
	}

	has(key: string): boolean {
		return key in this.getAll();
	}
}
