import { StateContract, SessionContract } from './types/index';
import { ChangeEvent } from './StateEventHandler';
import { StateStorage } from './StateStorage';
export declare class Session implements SessionContract {
    key: string;
    token_key: string;
    Storage: StateStorage;
    private state;
    private temp;
    private flash;
    private nonpersisting;
    private listeners;
    [key: string]: any;
    /**
     * Creates a new Session.
     * @param {string} key The unique key to store session data.
     * @param {string} token_key The unique key to store the user's token.
     */
    constructor(key?: string, token_key?: string, storage?: StateStorage);
    /**
     * Changes the current storage to be used.
     * @param storage The storage to be replaced.
     */
    use(storage: StateStorage, clear?: boolean): this;
    /**
     * Add an event listener to a key in the state.
     * @param key The key that we will attach the event listener to.
     * @param callback The callback that will be called everytime the key's value is updated.
     */
    listen<T>(key: string, callback: ChangeEvent<T>): number;
    /**
     * Remove an event listener.
     * @param key The key of the event listeners.
     * @param index The index of the particular listener that we want to remove.
     */
    unlisten(key: string, index: number): this;
    /**
     * Dispatch all event listeners attached to the specified key.
     * @param key The key of the data being set.
     * @param data The actual data that will be set on the key.
     */
    private dispatch;
    /**
     * Starts a persistent session.
     */
    start(): this;
    /**
     * Checks if a key is set in the Session.
     * @param {string} key
     * @return {boolean}
     */
    has(key: string): boolean;
    /**
     * Gets a value from the Session using the specified key.
     *
     * Returns null if it does not exist.
     * @param {string} key
     */
    get<T = any>(key: string): T;
    /**
     * Sets a key with a given value or data.
     *
     * 'key' and 'session-id' are reserved words thus using them as keys will not be saved.
     * @param {string} key The key that will represent the value or data.
     * @param {any} data The data or value that will be saved. Typically this will be an object but it can be anything else.
     */
    set(key: string, data: any): this;
    /**
     * Renew's the Session's ID.
     * @param {boolean} clear Whether to clear existing data or not.
     */
    renew(clear?: boolean): this;
    /**
     * Gets all the data that's saved in the Session.
     */
    private getAll;
    /**
     * Saves the data into `Storage`.
     *
     * This overwrites any existing data that is saved, thus is not advised to be used directly.
     * Use set() instead.
     * @param {object} data
     */
    private setAll;
    /**
     * Gets the current ID of the Session which contains the time of when the Session was first used.
     */
    id(): string;
    /**
     * Clears all saved data and creates a new Session ID.
     */
    clear(): this;
    /**
     * Clears all saved data including the data from the other
     * child sessions (FlashSession, ExpiringSession, NonPersistingSession).
     */
    clearAll(): this;
    /**
     * Removes a value or data from the Session if the key exists.
     * @param {string} key
     */
    remove(key: string): this;
    /**
     * This method is used as a getter and setter for the user's token.
     *
     * Passing arguments (token and remember) saves a token while not passing
     * any will return a token if it exists or null if it does not exist.
     * @param token If passed a token, it will be saved. Otherwise a token will be returned if it exists already.
     * @param remember Whether to persist the token on page reloads or not.
     */
    token(token?: string, remember?: boolean): this | string | null;
    /**
     * Removes the token that is currently saved if there is any.
     */
    revokeToken(): this;
    /**
     * Checks if a token is saved.
     */
    hasToken(): boolean;
    /**
     * This method is used as a getter and setter for the user's data.
     *
     * Passing arguments (user and remember) saves a user while not passing
     * any will return a user if it exists or null if it does not exist.
     * @param user If passed a user object, it will be saved. Otherwise a user will be returned if it exists already.
     * @param remember Whether to persist the user on page reloads or not.
     */
    user(user?: any, remember?: boolean): any;
    /**
     * Removes the user if it exists in the Session.
     *
     * This method does NOT remove the user's token if there is any,
     * otherwise you also need to call Session.revokeToken()
     */
    removeUser(): this;
    /**
     * Converts the Session's current state into a JSON string.
     */
    toJSON(): string;
    /**
     * Converts the Session's current state into a JSON string.
     */
    toObject(): StateContract;
}
