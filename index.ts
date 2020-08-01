import SessionContract, {
	StateContract,
	ExpiringStateContract,
	ExpiryContract,
	FlashStateContract,
	NonPersistingStateContract,
} from './types';

export default class Session implements SessionContract {
	key: string;
	token_key: string;
	Storage: typeof window.localStorage;
	private state: StateContract;
	private temp: ExpiringSession;
	private flash: FlashSession;
	private nonpersisting: NonPersistingSession;
	[key: string]: any;
	constructor() {
		this.key = 'avidian-session-key';
		this.token_key = 'avidian-token-key';
		this.Storage = window.localStorage;
		this.state = {};
		this.temp = new ExpiringSession(this);
		this.flash = new FlashSession(this);
		this.nonpersisting = new NonPersistingSession();
	}

	/**
	 * Starts a persistent session.
	 */
	start() {
		const data = this.getAll() as StateContract;
		data['session-id'] = `sess:${Date.now()}`;
		return this.setAll(data);
	}

	/**
	 * Checks if a key is set in the Session.
	 * @param {string} key
	 * @return {boolean}
	 */
	has(key: string): boolean {
		return key in this.getAll();
	}

	/**
	 * Gets a value from the Session using the specified key.
	 *
	 * Returns null if it does not exist.
	 * @param {string} key
	 * @returns {any} data
	 */
	get(key: string): any {
		const data = this.getAll() as StateContract;
		if (data.hasOwnProperty(key)) {
			return data[key];
		}
		return null;
	}

	/**
	 * Sets a key with a given value or data.
	 *
	 * 'key' and 'session-id' are reserved words thus using them as keys will not be saved.
	 * @param {string} key - The key that will represent the value or data.
	 * @param {any} data - The data or value that will be saved. Typically this will be an object but it can be anything else.
	 * @returns {this} this
	 */
	set(key: string, data: any): this {
		if (key === 'session-id' || key === 'key') {
			return this;
		}
		const session_data = this.getAll();
		if (!('session-id' in session_data)) {
			this.start();
		}
		return this.setAll({
			...session_data,
			[key]: data,
		});
	}

	/**
	 * Renew's the Session's ID.
	 * @param {boolean} clear - Whether to clear existing data or not.
	 * @returns {this} this
	 */
	renew(clear: boolean = false): this {
		if (clear) {
			return this.clear();
		} else {
			const data = this.getAll();
			data['session-id'] = `sess:${Date.now()}`;
			return this.setAll(data);
		}
	}

	/**
	 * Gets all the data that's saved in the Session.
	 * @returns {object} data
	 */
	private getAll(): StateContract {
		try {
			const data = JSON.parse(this.Storage.getItem(this.key) || '');
			return data;
		} catch (error) {
			return {};
		}
	}

	/**
	 * Saves the data into the window.localStorage object.
	 *
	 * This overwrites any existing data that is saved, thus is not advised to be used directly.
	 * Use set() instead.
	 * @param {object} data
	 * @returns {this} this
	 */
	private setAll(data: object): this {
		this.state = data;
		this.Storage.setItem(this.key, JSON.stringify(data));
		return this;
	}

	/**
	 * Gets the current ID of the Session which contains the time of when the Session was first used.
	 * @returns {string} Session ID
	 */
	id(): string {
		return this.get('session-id');
	}

	/**
	 * Clears all saved data and creates a new Session ID.
	 * @returns {this} this
	 */
	clear(): this {
		this.state = {};
		this.setAll({});
		return this.start();
	}

	/**
	 * Clears all saved data including the data from the other
	 * child sessions (FlashSession, ExpiringSession, NonPersistingSession).
	 * @returns {this} this
	 */
	clearAll(): this {
		this.clear();
		this.flash.clear();
		this.temp.clear();
		this.nonpersisting.clear();
		return this;
	}

	/**
	 * Removes a value or data from the Session if the key exists.
	 * @param {string} key
	 */
	remove(key: string): this {
		if (this.hash(key)) {
			const data = this.getAll() as any;
			delete data[key];
			this.setAll(data);
			delete this.state;
			delete this[key];
		}
		return this;
	}

	/**
	 * This method is used as a getter and setter for the user's token.
	 *
	 * Passing arguments (token and remember) saves a token while not passing
	 * any will return a token if it exists or null if it does not exist.
	 * @param token - If passed a token, it will be saved. Otherwise a token will be returned if it exists already.
	 * @param remember - Whether to persist the token on page reloads or not.
	 * @returns {(this|string|null)} this | string | null
	 */
	token(token?: string, remember = true): this | string | null {
		if (token !== undefined) {
			if (remember) {
				return this.set(this.token_key, token);
			} else {
				this.nonpersisting.set(this.token_key, token);
				return this;
			}
		}
		if (this.has(this.token_key)) {
			// persisting
			return this.get(this.token_key) as string;
		} else if (this.nonpersisting.has(this.token_key)) {
			// non persisting
			return this.nonpersisting.get(this.token_key) as string;
		}
		return null;
	}

	/**
	 * Removes the token that is currently saved if there is any.
	 * @returns {this} this
	 */
	revokeToken(): this {
		if (this.has(this.token_key)) {
			return this.remove(this.token_key);
		} else if (this.nonpersisting.has(this.token_key)) {
			this.nonpersisting.remove(this.token_key);
			return this;
		}
		return this;
	}

	/**
	 * Checks if a token is saved.
	 * @returns {boolean} true or false
	 */
	hasToken(): boolean {
		return (
			this.has(this.token_key) || this.nonpersisting.has(this.token_key)
		);
	}

	/**
	 * This method is used as a getter and setter for the user's data.
	 *
	 * Passing arguments (user and remember) saves a user while not passing
	 * any will return a user if it exists or null if it does not exist.
	 * @param user - If passed a user, it will be saved. Otherwise a user will be returned if it exists already.
	 * @param remember - Whether to persist the user on page reloads or not.
	 * @returns {(this|user|null)} this | user | null
	 */
	user(user?: any, remember = true): any {
		if (user !== undefined) {
			if (remember) {
				return this.set('user-session', user);
			} else {
				this.nonpersisting.set('user-session', user);
				return this;
			}
		}
		if (this.has('user-session')) {
			// persisting
			return this.get('user-session');
		} else if (this.nonpersisting.has('user-session')) {
			// non persisting
			return this.nonpersisting.get('user-session');
		}
		return null;
	}

	/**
	 * Removes the user if it exists in the Session.
	 *
	 * This method does NOT remove the user's token if there is any,
	 * otherwise you also need to call Session.revokeToken()
	 * @returns {this} this
	 */
	removeUser(): this {
		if (this.has('user-session')) {
			// persisting
			this.remove('user-session');
		} else if (this.nonpersisting.has('user-session')) {
			// non persisting
			this.nonpersisting.remove('user-session');
		}
		return this;
	}
}

export class SessionException extends Error {
	[key: string]: any;
	constructor(message: string) {
		super(message);
	}
	toJSON(): object {
		const data: { [key: string]: any } = {};
		Object.keys(this).forEach((key) => {
			data[key] = this[key];
		});
		return data;
	}
	toObject() {
		return this.toJSON();
	}
}

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

export class FlashSession implements FlashStateContract {
	key: string;
	parent: Session;
	constructor(session: Session) {
		this.key = 'avidian-flash-session-key';
		this.parent = session;
		const state = this.getAll();
		if (state === null) {
			this.setAll({});
		} else {
			this.setAll(state);
		}
	}
	get(key: string): any {
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

export class NonPersistingSession implements NonPersistingStateContract {
	key: string;
	Storage: typeof window.sessionStorage;
	constructor() {
		this.key = 'avidian-non-persisting-session-key';
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
