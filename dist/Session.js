import { ExpiringSession } from './ExpiringSession';
import { FlashSession } from './FlashSession';
import { NonPersistingSession } from './NonPersistingSession';
import { SessionException } from './SessionException';
import { StateEventHandler } from './StateEventHandler';
export class Session {
    /**
     * Creates a new Session.
     * @param {string} key The unique key to store session data.
     * @param {string} token_key The unique key to store the user's token.
     */
    constructor(key, token_key, storage) {
        this.listeners = {};
        this.key = key ? key : 'avidian-session-key';
        this.token_key = token_key ? token_key : 'avidian-token-key';
        this.Storage = storage || localStorage;
        this.state = {};
        this.temp = new ExpiringSession(this);
        this.flash = new FlashSession(this);
        this.nonpersisting = new NonPersistingSession(this.key);
    }
    /**
     * Changes the current storage to be used.
     * @param storage The storage to be replaced.
     */
    use(storage, clear = false) {
        const data = { ...this.getAll() };
        if (clear) {
            this.clearAll();
        }
        this.Storage = storage;
        this.setAll(data);
        return this;
    }
    /**
     * Add an event listener to a key in the state.
     * @param key The key that we will attach the event listener to.
     * @param callback The callback that will be called everytime the key's value is updated.
     */
    listen(key, callback) {
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
    unlisten(key, index) {
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
    dispatch(key, data) {
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
    has(key) {
        return key in this.getAll();
    }
    /**
     * Gets a value from the Session using the specified key.
     *
     * Returns null if it does not exist.
     * @param {string} key
     */
    get(key) {
        const data = this.getAll();
        if (key in data) {
            return data[key];
        }
        throw new SessionException(`${key} does not exist in session.`);
    }
    /**
     * Sets a key with a given value or data.
     *
     * 'key' and 'session-id' are reserved words thus using them as keys will not be saved.
     * @param {string} key The key that will represent the value or data.
     * @param {any} data The data or value that will be saved. Typically this will be an object but it can be anything else.
     */
    set(key, data) {
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
    renew(clear = false) {
        if (clear) {
            return this.clear();
        }
        else {
            const data = this.getAll();
            data['session-id'] = `sess:${Date.now()}`;
            return this.setAll(data);
        }
    }
    /**
     * Gets all the data that's saved in the Session.
     */
    getAll() {
        try {
            const data = JSON.parse(this.Storage.getItem(this.key) || '{}');
            return data;
        }
        catch (error) {
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
    setAll(data) {
        this.state = data;
        this.Storage.setItem(this.key, JSON.stringify(data));
        return this;
    }
    /**
     * Gets the current ID of the Session which contains the time of when the Session was first used.
     */
    id() {
        return this.get('session-id');
    }
    /**
     * Clears all saved data and creates a new Session ID.
     */
    clear() {
        this.state = {};
        this.setAll({});
        return this.start();
    }
    /**
     * Clears all saved data including the data from the other
     * child sessions (FlashSession, ExpiringSession, NonPersistingSession).
     */
    clearAll() {
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
    remove(key) {
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
    token(token, remember = true) {
        if (token !== undefined) {
            if (remember) {
                return this.set(this.token_key, token);
            }
            else {
                this.nonpersisting.set(this.token_key, token);
                return this;
            }
        }
        if (this.has(this.token_key)) {
            // persisting
            return this.get(this.token_key);
        }
        else if (this.nonpersisting.has(this.token_key)) {
            // non persisting
            return this.nonpersisting.get(this.token_key);
        }
        return null;
    }
    /**
     * Removes the token that is currently saved if there is any.
     */
    revokeToken() {
        if (this.has(this.token_key)) {
            return this.remove(this.token_key);
        }
        else if (this.nonpersisting.has(this.token_key)) {
            this.nonpersisting.remove(this.token_key);
            return this;
        }
        return this;
    }
    /**
     * Checks if a token is saved.
     */
    hasToken() {
        return (this.has(this.token_key) || this.nonpersisting.has(this.token_key));
    }
    /**
     * This method is used as a getter and setter for the user's data.
     *
     * Passing arguments (user and remember) saves a user while not passing
     * any will return a user if it exists or null if it does not exist.
     * @param user If passed a user object, it will be saved. Otherwise a user will be returned if it exists already.
     * @param remember Whether to persist the user on page reloads or not.
     */
    user(user, remember = true) {
        if (user !== undefined) {
            if (remember) {
                return this.set('user-session', user);
            }
            else {
                this.nonpersisting.set('user-session', user);
                return this;
            }
        }
        if (this.has('user-session')) {
            // persisting
            return this.get('user-session');
        }
        else if (this.nonpersisting.has('user-session')) {
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
    removeUser() {
        if (this.has('user-session')) {
            // persisting
            this.remove('user-session');
        }
        else if (this.nonpersisting.has('user-session')) {
            // non persisting
            this.nonpersisting.remove('user-session');
        }
        return this;
    }
    /**
     * Converts the Session's current state into a JSON string.
     */
    toJSON() {
        return JSON.stringify(this.state);
    }
    /**
     * Converts the Session's current state into a JSON string.
     */
    toObject() {
        return this.state;
    }
}
