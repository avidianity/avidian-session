import { StateContract, SessionContract } from './types/index';
import { ExpiringSession } from './ExpiringSession';
import { FlashSession } from './FlashSession';
import { NonPersistingSession } from './NonPersistingSession';
import { ChangeEvent, StateEventHandler } from './StateEventHandler';
import { StateStorage } from './StateStorage';
import serialize from 'serialize-javascript';

export class Session implements SessionContract {
	key: string;
	token_key: string;
	Storage: StateStorage;
	protected state: StateContract;
	protected temp: ExpiringSession;
	protected flash: FlashSession;
	protected nonpersisting: NonPersistingSession;
	protected listeners: { [key: string]: StateEventHandler } = {};
	[key: string]: any;

	/**
	 * Creates a new Session.
	 * @param {string} key The unique key to store session data.
	 * @param {string} token_key The unique key to store the user's token.
	 */
	constructor(key?: string, token_key?: string, storage?: StateStorage) {
		this.key = key ? key : 'session-key';
		this.token_key = token_key ? token_key : 'token-key';
		this.Storage = storage || localStorage;
		this.state = {};
		this.temp = new ExpiringSession(this);
		this.flash = new FlashSession(this);
		this.nonpersisting = new NonPersistingSession(this.key);
	}

	/**
	 * Changes the current storage to be used.
	 * @param storage The storage to be replaced.
	 * @param {boolean} clear Whether to clear the data or not.
	 */
	use(storage: StateStorage, clear: boolean = false) {
		if (clear) {
			this.clearAll();
		}
		const data = { ...this.getAll() };
		this.Storage = storage;
		this.setAll(data);
		return this;
	}

	/**
	 * Add an event listener to a key in the state.
	 * @param key The key that we will attach the event listener to.
	 * @param callback The callback that will be called everytime the key's value is updated.
	 */
	listen<T>(key: string, callback: ChangeEvent<T>) {
		if (!(key in this.listeners)) {
			this.listeners[key] = new StateEventHandler(key);
		}
		return this.listeners[key].add(callback);
	}

	/**
	 * Remove an event listener.
	 * @param key The key of the event listeners.
	 * @param index The index of the particular listener that we want to remove.
	 */
	unlisten(key: string, index: number) {
		if (key in this.listeners) {
			this.listeners[key].remove(index);
		}
		return this;
	}

	/**
	 * Dispatch all event listeners attached to the specified key.
	 * @param key The key of the data being set.
	 * @param data The actual data that will be set on the key.
	 */
	protected dispatch(key: string, data: any) {
		if (key in this.listeners) {
			this.listeners[key].call(data);
		}
		return this;
	}

	/**
	 * Starts a persistent session.
	 */
	start() {
		const data = this.getAll();
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
	 */
	get<T = any>(key: string): T {
		const data = this.getAll();
		return data[key];
	}

	/**
	 * Sets a key with a given value or data.
	 *
	 * 'key' and 'session-id' are reserved words thus using them as keys will not be saved.
	 * @param {string} key The key that will represent the value or data.
	 * @param {any} data The data or value that will be saved. Typically this will be an object but it can be anything else.
	 */
	set(key: string, data: any): this {
		if (key === 'session-id' || key === 'key') {
			return this;
		}

		if (!this.has('session-id')) {
			this.start();
		}

		return this.dispatch(key, data).setAll({
			...this.getAll(),
			[key]: data,
		});
	}

	/**
	 * Renew's the Session's ID.
	 * @param {boolean} clear Whether to clear existing data or not.
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
	 */
	protected getAll(): StateContract {
		try {
			const raw = this.Storage.getItem(this.key);
			if (!raw) {
				return {};
			}
			const data = eval(`(${raw})`);
			this.state = data;
			return data;
		} catch (error) {
			return {};
		}
	}

	/**
	 * Saves the data into `Storage`.
	 *
	 * This overwrites any existing data that is saved, thus is not advised to be used directly.
	 * Use set() instead.
	 * @param {object} data
	 */
	protected setAll(data: object): this {
		this.state = data;
		this.Storage.setItem(this.key, serialize(data));
		return this;
	}

	/**
	 * Gets the current ID of the Session which contains the time of when the Session was first used.
	 */
	id(): string {
		return this.get('session-id');
	}

	/**
	 * Clears all saved data and creates a new Session ID.
	 */
	clear(): this {
		this.state = {};
		this.setAll({});
		return this.start();
	}

	/**
	 * Clears all saved data including the data from the other
	 * child sessions (FlashSession, ExpiringSession, NonPersistingSession).
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
		if (this.has(key)) {
			const data = this.getAll();
			delete data[key];
			delete this.state[key];
			this.dispatch(key, null).setAll(data);
		}
		return this;
	}

	/**
	 * This method is used as a getter and setter for the user's token.
	 *
	 * Passing arguments (token and remember) saves a token while not passing
	 * any will return a token if it exists or null if it does not exist.
	 * @param token If passed a token, it will be saved. Otherwise a token will be returned if it exists already.
	 * @param remember Whether to persist the token on page reloads or not.
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
	 */
	hasToken(): boolean {
		return this.has(this.token_key) || this.nonpersisting.has(this.token_key);
	}

	/**
	 * This method is used as a getter and setter for the user's data.
	 *
	 * Passing arguments (user and remember) saves a user while not passing
	 * any will return a user if it exists or null if it does not exist.
	 * @param user If passed a user object, it will be saved. Otherwise a user will be returned if it exists already.
	 * @param remember Whether to persist the user on page reloads or not.
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

	/**
	 * Converts the Session's current state into a JSON string.
	 */
	toJSON(): string {
		return JSON.stringify(this.state);
	}

	/**
	 * Converts the Session's current state into a JSON string.
	 */
	toObject(): StateContract {
		return this.state;
	}
}
