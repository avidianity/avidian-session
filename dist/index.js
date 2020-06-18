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
exports.FlashSession = exports.ExpiringSession = exports.SessionException = exports.Session = void 0;
var Session = /** @class */ (function () {
    function Session() {
        this.key = 'vue-session-key';
        this.token_key = 'vue-token-key';
        this.Storage = window.localStorage;
        this.state = {};
        this.temp = new ExpiringSession(this);
        this.flash = new FlashSession(this);
    }
    Session.prototype.start = function () {
        var data = this.getAll();
        data['session-id'] = "sess:" + Date.now();
        return this.setAll(data);
    };
    Session.prototype.has = function (key) {
        return key in this.getAll();
    };
    Session.prototype.get = function (key) {
        var data = this.getAll();
        if (data.hasOwnProperty(key)) {
            return data[key];
        }
        return null;
    };
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
    Session.prototype.renew = function (clear) {
        if (clear === void 0) { clear = false; }
        if (clear) {
            this.clear();
            return this.setAll({
                'session-id': "sess:" + Date.now(),
            });
        }
        else {
            var data = this.getAll();
            data['session-id'] = "sess:" + Date.now();
            return this.setAll(data);
        }
    };
    Session.prototype.getAll = function () {
        try {
            var data = JSON.parse(this.Storage.getItem(this.key) || '');
            return data;
        }
        catch (error) {
            return {};
        }
    };
    Session.prototype.setAll = function (data) {
        var _this = this;
        var _loop_1 = function (key) {
            if (!(key in this_1.state)) {
                Object.defineProperty(this_1, key, {
                    configurable: true,
                    get: function () {
                        return _this.state[key];
                    },
                    set: function (value) {
                        throw new SessionException('Magic properties cannot be set explicitly. Use Session.set(key, data) instead.');
                    },
                });
            }
        };
        var this_1 = this;
        for (var key in data) {
            _loop_1(key);
        }
        this.state = data;
        this.Storage.setItem(this.key, JSON.stringify(data));
        return this;
    };
    Session.prototype.id = function () {
        return this.get('session-id');
    };
    Session.prototype.clear = function () {
        for (var key in this.state) {
            this.remove(key);
        }
        return this.setAll({});
    };
    Session.prototype.remove = function (key) {
        delete this.state;
        delete this[key];
        return this;
    };
    Session.prototype.token = function (token) {
        if (token !== undefined) {
            return this.set(this.token_key, token);
        }
        return this.get(this.token_key);
    };
    Session.prototype.revokeToken = function () {
        return this.remove(this.token_key);
    };
    Session.prototype.hasToken = function () {
        return this.has(this.token_key);
    };
    Session.prototype.user = function (user) {
        if (user !== undefined) {
            return this.set('user', user);
        }
        return this.get('user');
    };
    return Session;
}());
exports.Session = Session;
var SessionException = /** @class */ (function (_super) {
    __extends(SessionException, _super);
    function SessionException(message) {
        return _super.call(this, message) || this;
    }
    return SessionException;
}(Error));
exports.SessionException = SessionException;
var ExpiringSession = /** @class */ (function () {
    function ExpiringSession(parent) {
        this.id = "sess-temp:" + Date.now();
        this.key = 'vue-expiring-session-key';
        this.parent = parent;
        this.setAll({
            'session-id': this.id,
        });
    }
    ExpiringSession.prototype.getAll = function () {
        return this.parent.get(this.key);
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
        this.setAll({});
        return this;
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
        this.key = 'vue-flash-session-key';
        this.parent = session;
        this.setAll({});
    }
    FlashSession.prototype.get = function (key) {
        var data = this.getAll();
        var value = data[key];
        delete data[key];
        this.setAll(data);
        return value;
    };
    FlashSession.prototype.set = function (key, value) {
        var data = this.getAll();
        data[key] = value;
        return this.setAll(data);
    };
    FlashSession.prototype.getAll = function () {
        return this.parent.get(this.key);
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
        return this;
    };
    FlashSession.prototype.clear = function () {
        return this.setAll({});
    };
    return FlashSession;
}());
exports.FlashSession = FlashSession;
exports.default = {
    install: function (Vue, options) {
        Vue.prototype.$session = new Session();
    },
};
