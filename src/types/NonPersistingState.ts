export interface NonPersistingState {
	key: string;
	Storage: typeof window.sessionStorage;
	get(key: string): any;
	set(key: string, value: any): this;
	remove(key: string): this;
	clear(): this;
	has(key: string): boolean;
}
