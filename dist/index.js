"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NonPersistingSession = exports.FlashSession = exports.ExpiringSession = exports.SessionException = void 0;
var Session = /** @class */ (function () {
    function Session() {
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
    Session.prototype.start = function () {
        var data = this.getAll();
        data['session-id'] = "sess:" + Date.now();
        return this.setAll(data);
    };
    /**
     * Checks if a key is set in the Session.
     * @param {string} key
     * @return {boolean}
     */
    Session.prototype.has = function (key) {
        return key in this.getAll();
    };
    /**
     * Gets a value from the Session using the specified key.
     *
     * Returns null if it does not exist.
     * @param {string} key
     * @returns {any} data
     */
    Session.prototype.get = function (key) {
        var data = this.getAll();
        if (data.hasOwnProperty(key)) {
            return data[key];
        }
        return null;
    };
    /**
     * Sets a key with a given value or data.
     *
     * 'key' and 'session-id' are reserved words thus using them as keys will not be saved.
     * @param {string} key - The key that will represent the value or data.
     * @param {any} data - The data or value that will be saved. Typically this will be an object but it can be anything else.
     * @returns {this} this
     */
    Session.prototype.set = function (key, data) {
        var _a;
        if (key === 'session-id' || key === 'key') {
            return this;
        }
        var session_data = this.getAll();
        if (!('session-id' in session_data)) {
            this.start();
        }
        return this.setAll(__assign(__assign({}, session_data), (_a = {}, _a[key] = data, _a)));
    };
    /**
     * Renew's the Session's ID.
     * @param {boolean} clear - Whether to clear existing data or not.
     * @returns {this} this
     */
    Session.prototype.renew = function (clear) {
        if (clear === void 0) { clear = false; }
        if (clear) {
            return this.clear();
        }
        else {
            var data = this.getAll();
            data['session-id'] = "sess:" + Date.now();
            return this.setAll(data);
        }
    };
    /**
     * Gets all the data that's saved in the Session.
     * @returns {object} data
     */
    Session.prototype.getAll = function () {
        try {
            var data = JSON.parse(this.Storage.getItem(this.key) || '');
            return data;
        }
        catch (error) {
            return {};
        }
    };
    /**
     * Saves the data into the window.localStorage object.
     *
     * This overwrites any existing data that is saved, thus is not advised to be used directly.
     * Use set() instead.
     * @param {object} data
     * @returns {this} this
     */
    Session.prototype.setAll = function (data) {
        this.state = data;
        this.Storage.setItem(this.key, JSON.stringify(data));
        return this;
    };
    /**
     * Gets the current ID of the Session which contains the time of when the Session was first used.
     * @returns {string} Session ID
     */
    Session.prototype.id = function () {
        return this.get('session-id');
    };
    /**
     * Clears all saved data and creates a new Session ID.
     * @returns {this} this
     */
    Session.prototype.clear = function () {
        this.state = {};
        this.setAll({});
        return this.start();
    };
    /**
     * Clears all saved data including the data from the other
     * child sessions (FlashSession, ExpiringSession, NonPersistingSession).
     * @returns {this} this
     */
    Session.prototype.clearAll = function () {
        this.clear();
        this.flash.clear();
        this.temp.clear();
        this.nonpersisting.clear();
        return this;
    };
    /**
     * Removes a value or data from the Session if the key exists.
     * @param {string} key
     */
    Session.prototype.remove = function (key) {
        if (this.hash(key)) {
            var data = this.getAll();
            delete data[key];
            this.setAll(data);
            delete this.state;
            delete this[key];
        }
        return this;
    };
    /**
     * This method is used as a getter and setter for the user's token.
     *
     * Passing arguments (token and remember) saves a token while not passing
     * any will return a token if it exists or null if it does not exist.
     * @param token - If passed a token, it will be saved. Otherwise a token will be returned if it exists already.
     * @param remember - Whether to persist the token on page reloads or not.
     * @returns {(this|string|null)} this | string | null
     */
    Session.prototype.token = function (token, remember) {
        if (remember === void 0) { remember = true; }
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
    };
    /**
     * Removes the token that is currently saved if there is any.
     * @returns {this} this
     */
    Session.prototype.revokeToken = function () {
        if (this.has(this.token_key)) {
            return this.remove(this.token_key);
        }
        else if (this.nonpersisting.has(this.token_key)) {
            this.nonpersisting.remove(this.token_key);
            return this;
        }
        return this;
    };
    /**
     * Checks if a token is saved.
     * @returns {boolean} true or false
     */
    Session.prototype.hasToken = function () {
        return (this.has(this.token_key) || this.nonpersisting.has(this.token_key));
    };
    /**
     * This method is used as a getter and setter for the user's data.
     *
     * Passing arguments (user and remember) saves a user while not passing
     * any will return a user if it exists or null if it does not exist.
     * @param user - If passed a user, it will be saved. Otherwise a user will be returned if it exists already.
     * @param remember - Whether to persist the user on page reloads or not.
     * @returns {(this|user|null)} this | user | null
     */
    Session.prototype.user = function (user, remember) {
        if (remember === void 0) { remember = true; }
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
    };
    /**
     * Removes the user if it exists in the Session.
     *
     * This method does NOT remove the user's token if there is any,
     * otherwise you also need to call Session.revokeToken()
     * @returns {this} this
     */
    Session.prototype.removeUser = function () {
        if (this.has('user-session')) {
            // persisting
            this.remove('user-session');
        }
        else if (this.nonpersisting.has('user-session')) {
            // non persisting
            this.nonpersisting.remove('user-session');
        }
        return this;
    };
    return Session;
}());
exports.default = Session;
var SessionException = /** @class */ (function (_super) {
    __extends(SessionException, _super);
    function SessionException(message) {
        return _super.call(this, message) || this;
    }
    SessionException.prototype.toJSON = function () {
        var _this = this;
        var data = {};
        Object.keys(this).forEach(function (key) {
            data[key] = _this[key];
        });
        return data;
    };
    SessionException.prototype.toObject = function () {
        return this.toJSON();
    };
    return SessionException;
}(Error));
exports.SessionException = SessionException;
var ExpiringSession = /** @class */ (function () {
    function ExpiringSession(parent) {
        this.id = "sess-temp:" + Date.now();
        this.key = 'avidian-expiring-session-key';
        this.parent = parent;
        if (!('session-id' in this.getAll())) {
            this.setAll({
                'session-id': this.id,
            });
        }
    }
    ExpiringSession.prototype.getAll = function () {
        try {
            var data = this.parent.get(this.key);
            return data !== null ? data : {};
        }
        catch (error) {
            return {};
        }
    };
    ExpiringSession.prototype.get = function (key) {
        var session = this.getAll();
        if (!(key in session)) {
            return null;
        }
        var now = new Date(Date.now());
        var data = session[key];
        var expiry = new Date(data.expiry);
        if (now > expiry) {
            this.remove(key);
            return null;
        }
        return data.value;
    };
    ExpiringSession.prototype.setAll = function (data) {
        this.parent.set(this.key, data);
        return this;
    };
    ExpiringSession.prototype.set = function (key, value, minutes) {
        var data = {
            value: value,
            expiry: new Date(Date.now() + minutes * 60 * 1000).getTime(),
        };
        var session = this.getAll();
        session[key] = data;
        this.setAll(session);
        return this;
    };
    ExpiringSession.prototype.remove = function (key) {
        var data = this.getAll();
        if (key in data) {
            delete data[key];
            this.setAll(data);
        }
        return this;
    };
    ExpiringSession.prototype.clear = function () {
        return this.renew(true);
    };
    ExpiringSession.prototype.has = function (key) {
        var session = this.getAll();
        if (!(key in session)) {
            return false;
        }
        var now = new Date(Date.now());
        var data = session[key];
        var expiry = new Date(data.expiry);
        if (now > expiry) {
            this.remove(key);
            return false;
        }
        return true;
    };
    ExpiringSession.prototype.renew = function (clear) {
        if (clear === void 0) { clear = false; }
        this.id = "sess-temp:" + Date.now();
        if (clear) {
            return this.setAll({
                'session-id': this.id,
            });
        }
        else {
            var data = this.getAll();
            data['session-id'] = this.id;
            return this.setAll(data);
        }
    };
    return ExpiringSession;
}());
exports.ExpiringSession = ExpiringSession;
var FlashSession = /** @class */ (function () {
    function FlashSession(session) {
        this.key = 'avidian-flash-session-key';
        this.parent = session;
        var state = this.getAll();
        if (state === null) {
            this.setAll({});
        }
        else {
            this.setAll(state);
        }
    }
    FlashSession.prototype.get = function (key) {
        var data = this.getAll();
        var value = data[key];
        this.remove(key);
        return value;
    };
    FlashSession.prototype.set = function (key, value) {
        var data = this.getAll();
        data[key] = value;
        return this.setAll(data);
    };
    FlashSession.prototype.getAll = function () {
        var state = this.parent.get(this.key);
        if (state === null) {
            return {};
        }
        return state;
    };
    FlashSession.prototype.setAll = function (data) {
        this.parent.set(this.key, data);
        return this;
    };
    FlashSession.prototype.has = function (key) {
        return key in this.getAll();
    };
    FlashSession.prototype.remove = function (key) {
        var data = this.getAll();
        delete data[key];
        this.setAll(data);
        return this;
    };
    FlashSession.prototype.clear = function () {
        return this.setAll({});
    };
    return FlashSession;
}());
exports.FlashSession = FlashSession;
var NonPersistingSession = /** @class */ (function () {
    function NonPersistingSession() {
        this.key = 'avidian-non-persisting-session-key';
        this.Storage = window.sessionStorage;
    }
    NonPersistingSession.prototype.get = function (key) {
        return this.has(key) ? this.getAll()[key] : null;
    };
    NonPersistingSession.prototype.getAll = function () {
        try {
            return JSON.parse(this.Storage.getItem(this.key) || '');
        }
        catch (error) {
            return {};
        }
    };
    NonPersistingSession.prototype.set = function (key, value) {
        var data = this.getAll();
        data[key] = value;
        return this.setAll(data);
    };
    NonPersistingSession.prototype.setAll = function (data) {
        this.Storage.setItem(this.key, JSON.stringify(data));
        return this;
    };
    NonPersistingSession.prototype.remove = function (key) {
        var data = this.getAll();
        delete data[key];
        return this.setAll(data);
    };
    NonPersistingSession.prototype.clear = function () {
        return this.setAll({});
    };
    NonPersistingSession.prototype.has = function (key) {
        return key in this.getAll();
    };
    return NonPersistingSession;
}());
exports.NonPersistingSession = NonPersistingSession;
