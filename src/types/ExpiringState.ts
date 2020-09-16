import { Session as SessionContract } from './Session';

export interface ExpiringState {
	id: string;
	key: string;
	parent: SessionContract;
	get(key: string): any;
	set(key: string, value: any, minutes: number): this;
	remove(key: string): this;
	clear(): this;
	has(key: string): boolean;
	renew(clear: boolean): this;
}
