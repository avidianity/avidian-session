import { StateContract, SessionContract } from './types/index';
export declare class Session implements SessionContract {
    key: string;
    token_key: string;
    Storage: typeof window.localStorage;
    private state;
    private temp;
    private flash;
    private nonpersisting;
    [key: string]: any;
    /**
     * Creates a new Session.
     * @param {string} key The unique key to store session data.
     * @param {string} token_key The unique key to store the user's token.
     */
    constructor(key?: string, token_key?: string);
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
     * @param {string} key The key that will represent the value or data.
     * @param {any} data The data or value that will be saved. Typically this will be an object but it can be anything else.
     * @returns {this} this
     */
    set(key: string, data: any): this;
    /**
     * Renew's the Session's ID.
     * @param {boolean} clear Whether to clear existing data or not.
     * @returns {this} this
     */
    renew(clear?: boolean): this;
    /**
     * Gets all the data that's saved in the Session.
     * @returns {object} data
     */
    private getAll;
    /**
     * Saves the data into the window.localStorage object.
     *
     * This overwrites any existing data that is saved, thus is not advised to be used directly.
     * Use set() instead.
     * @param {object} data
     * @returns {this} this
     */
    private setAll;
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
     * @param token If passed a token, it will be saved. Otherwise a token will be returned if it exists already.
     * @param remember Whether to persist the token on page reloads or not.
     * @returns {(this|string|null)} this | string | null
     */
    token(token?: string, remember?: boolean): this | string | null;
    /**
     * Removes the token that is currently saved if there is any.
     * @returns {this} this
     */
    revokeToken(): this;
    /**
     * Checks if a token is saved.
     * @returns {boolean}
     */
    hasToken(): boolean;
    /**
     * This method is used as a getter and setter for the user's data.
     *
     * Passing arguments (user and remember) saves a user while not passing
     * any will return a user if it exists or null if it does not exist.
     * @param user If passed a user object, it will be saved. Otherwise a user will be returned if it exists already.
     * @param remember Whether to persist the user on page reloads or not.
     * @returns {(this|user|null)} this | user | null
     */
    user(user?: any, remember?: boolean): any;
    /**
     * Removes the user if it exists in the Session.
     *
     * This method does NOT remove the user's token if there is any,
     * otherwise you also need to call Session.revokeToken()
     * @returns {this} this
     */
    removeUser(): this;
    /**
     * Converts the Session's current state into a JSON string.
     *
     * @returns {string} state
     */
    toJSON(): string;
    /**
     * Converts the Session's current state into a JSON string.
     *
     * @returns {StateContract} state
     */
    toObject(): StateContract;
}
