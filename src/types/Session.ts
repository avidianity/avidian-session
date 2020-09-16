import { State as StateContract } from './State';

export interface Session {
	key: string;
	Storage: typeof window.localStorage;
	start(): this;
	has(key: string): boolean;
	get(key: string): any;
	set(key: string, data: any): this;
	renew(clear: boolean): this;
	id(): string;
	clear(): this;
	clearAll(): this;
	remove(key: string): this;
	token(token?: string, remember?: boolean): this | string | null;
	revokeToken(): this;
	hasToken(): boolean;
	user(user?: any, remember?: boolean): any;
	removeUser(): this;
	toJSON(): string;
	toObject(): StateContract;
}
