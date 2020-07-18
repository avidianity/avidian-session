import SessionContract, { StateContract, ExpiringStateContract, FlashStateContract, NonPersistingStateContract } from './types';
export default class Session implements SessionContract {
    key: string;
    token_key: string;
    Storage: typeof window.localStorage;
    state: StateContract;
    temp: ExpiringSession;
    flash: FlashSession;
    nonpersisting: NonPersistingSession;
    [key: string]: any;
    constructor();
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
     * @returns {any} data
     */
    get(key: string): any;
    /**
     * Sets a key with a given value or data.
     *
     * 'key' and 'session-id' are reserved words thus using them as keys will not be saved.
     * @param {string} key - The key that will represent the value or data.
     * @param {any} data - The data or value that will be saved. Typically this will be an object but it can be anything else.
     * @returns {this} this
     */
    set(key: string, data: any): this;
    /**
     * Renew's the Session's ID.
     * @param {boolean} clear - Whether to clear existing data or not.
     * @returns {this} this
     */
    renew(clear?: boolean): this;
    /**
     * Gets all the data that's saved in the Session.
     * @returns {object} data
     */
    getAll(): StateContract;
    /**
     * Saves the data into the window.localStorage object.
     *
     * This overwrites any existing data that is saved, thus is not advised to be used directly.
     * Use set() instead.
     * @param {object} data
     * @returns {this} this
     */
    setAll(data: object): this;
    /**
     * Gets the current ID of the Session which contains the time of when the Session was first used.
     * @returns {string} Session ID
     */
    id(): string;
    /**
     * Clears all saved data and creates a new Session ID.
     * @returns {this} this
     */
    clear(): this;
    /**
     * Clears all saved data including the data from the other
     * child sessions (FlashSession, ExpiringSession, NonPersistingSession).
     * @returns {this} this
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
     * @param token - If passed a token, it will be saved. Otherwise a token will be returned if it exists already.
     * @param remember - Whether to persist the token on page reloads or not.
     * @returns {(this|string|null)} set = this, get = string | null
     */
    token(token?: string, remember?: boolean): this | string | null;
    /**
     * Removes the token that is currently saved if there is any.
     * @returns {this} this
     */
    revokeToken(): this;
    /**
     * Checks if a token is saved.
     * @returns {boolean} true or false
     */
    hasToken(): boolean;
    /**
     * This method is used as a getter and setter for the user's data.
     *
     * Passing arguments (user and remember) saves a user while not passing
     * any will return a user if it exists or null if it does not exist.
     * @param user - If passed a user, it will be saved. Otherwise a user will be returned if it exists already.
     * @param remember - Whether to persist the user on page reloads or not.
     * @returns {(this|user|null)} set = this, get = user | null
     */
    user(user?: any, remember?: boolean): any;
    /**
     * Removes the user if it exists in the Session.
     *
     * This method does NOT remove the user's token if there is any.
     * @returns {this} this
     */
    removeUser(): this;
}
export declare class SessionException extends Error {
    [key: string]: any;
    constructor(message: string);
    toJSON(): object;
    toObject(): object;
}
export declare class ExpiringSession implements ExpiringStateContract {
    id: string;
    key: string;
    parent: Session;
    constructor(parent: Session);
    getAll(): any;
    get(key: string): any;
    setAll(data: any): this;
    set(key: string, value: any, minutes: number): this;
    remove(key: string): this;
    clear(): this;
    has(key: string): boolean;
    renew(clear?: boolean): this;
}
export declare class FlashSession implements FlashStateContract {
    key: string;
    parent: Session;
    constructor(session: Session);
    get(key: string): any;
    set(key: string, value: any): this;
    getAll(): any;
    setAll(data: any): this;
    has(key: string): boolean;
    remove(key: string): this;
    clear(): this;
}
export declare class NonPersistingSession implements NonPersistingStateContract {
    key: string;
    Storage: typeof window.sessionStorage;
    constructor();
    get(key: string): any;
    getAll(): object;
    set(key: string, value: any): this;
    setAll(data: object): this;
    remove(key: string): this;
    clear(): this;
    has(key: string): boolean;
}
