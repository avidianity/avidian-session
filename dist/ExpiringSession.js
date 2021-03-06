export class ExpiringSession {
    constructor(parent) {
        this.id = `sess-temp:${Date.now()}`;
        this.key = 'expiring-session-key';
        this.parent = parent;
        const data = this.getAll();
        if (data && !('session-id' in data)) {
            this.setAll({
                'session-id': this.id,
            });
        }
    }
    getAll() {
        if (!this.parent.has(this.key)) {
            this.setAll({});
        }
        return this.parent.get(this.key);
    }
    get(key) {
        const session = this.getAll();
        if (!(key in session)) {
            return null;
        }
        const now = new Date(Date.now());
        const data = session[key];
        const expiry = new Date(data.expiry);
        if (now > expiry) {
            this.remove(key);
            return null;
        }
        return data.value;
    }
    setAll(data) {
        this.parent.set(this.key, data);
        return this;
    }
    set(key, value, minutes) {
        const data = {
            value,
            expiry: new Date(Date.now() + minutes * 60 * 1000).getTime(),
        };
        const session = this.getAll();
        session[key] = data;
        this.setAll(session);
        return this;
    }
    remove(key) {
        const data = this.getAll();
        if (key in data) {
            delete data[key];
            this.setAll(data);
        }
        return this;
    }
    clear() {
        return this.renew(true);
    }
    has(key) {
        const session = this.getAll();
        if (!(key in session)) {
            return false;
        }
        const now = new Date(Date.now());
        const data = session[key];
        const expiry = new Date(data.expiry);
        if (now > expiry) {
            this.remove(key);
            return false;
        }
        return true;
    }
    renew(clear = false) {
        this.id = `sess-temp:${Date.now()}`;
        if (clear) {
            return this.setAll({
                'session-id': this.id,
            });
        }
        else {
            const data = this.getAll();
            data['session-id'] = this.id;
            return this.setAll(data);
        }
    }
}
