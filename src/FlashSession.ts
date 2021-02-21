import { FlashStateContract, SessionContract } from './types/index';

export class FlashSession implements FlashStateContract {
	key: string;
	parent: SessionContract;

	constructor(session: SessionContract) {
		this.key = 'flash-session-key';
		this.parent = session;
		const state = this.getAll();
		if (state === null) {
			this.setAll({});
		} else {
			this.setAll(state);
		}
	}

	get<T = any>(key: string): T {
		const data = this.getAll();
		const value = data[key];
		this.remove(key);
		return value;
	}

	set(key: string, value: any): this {
		const data = this.getAll();
		data[key] = value;
		return this.setAll(data);
	}

	private getAll(): any {
		const state = this.parent.get(this.key);
		if (state === null) {
			return {};
		}
		return state;
	}

	private setAll(data: any): this {
		this.parent.set(this.key, data);
		return this;
	}

	has(key: string): boolean {
		return key in this.getAll();
	}

	remove(key: string): this {
		const data = this.getAll();
		delete data[key];
		this.setAll(data);
		return this;
	}

	clear(): this {
		return this.setAll({});
	}
}
