import { ExpiringStateContract, ExpiryContract } from './types/index';
import { Session } from './Session';

export class ExpiringSession implements ExpiringStateContract {
	id: string;
	key: string;
	parent: Session;
	constructor(parent: Session) {
		this.id = `sess-temp:${Date.now()}`;
		this.key = 'avidian-expiring-session-key';
		this.parent = parent;
		if (!('session-id' in this.getAll())) {
			this.setAll({
				'session-id': this.id,
			});
		}
	}
	private getAll(): any {
		try {
			const data = this.parent.get(this.key);
			return data !== null ? data : {};
		} catch (error) {
			return {};
		}
	}
	get(key: string): any {
		const session = this.getAll();
		if (!(key in session)) {
			return null;
		}
		const now = new Date(Date.now());
		const data = session[key] as ExpiryContract;
		const expiry = new Date(data.expiry);
		if (now > expiry) {
			this.remove(key);
			return null;
		}
		return data.value;
	}
	private setAll(data: any): this {
		this.parent.set(this.key, data);
		return this;
	}
	set(key: string, value: any, minutes: number): this {
		const data: ExpiryContract = {
			value,
			expiry: new Date(Date.now() + minutes * 60 * 1000).getTime(),
		};
		const session = this.getAll();
		session[key] = data;
		this.setAll(session);
		return this;
	}
	remove(key: string): this {
		const data = this.getAll();
		if (key in data) {
			delete data[key];
			this.setAll(data);
		}
		return this;
	}
	clear(): this {
		return this.renew(true);
	}
	has(key: string): boolean {
		const session = this.getAll();
		if (!(key in session)) {
			return false;
		}
		const now = new Date(Date.now());
		const data = session[key] as ExpiryContract;
		const expiry = new Date(data.expiry);
		if (now > expiry) {
			this.remove(key);
			return false;
		}
		return true;
	}
	renew(clear: boolean = false): this {
		this.id = `sess-temp:${Date.now()}`;
		if (clear) {
			return this.setAll({
				'session-id': this.id,
			});
		} else {
			const data = this.getAll();
			data['session-id'] = this.id;
			return this.setAll(data);
		}
	}
}
