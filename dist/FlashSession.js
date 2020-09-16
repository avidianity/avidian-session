export class FlashSession {
    constructor(session) {
        this.key = 'avidian-flash-session-key';
        this.parent = session;
        const state = this.getAll();
        if (state === null) {
            this.setAll({});
        }
        else {
            this.setAll(state);
        }
    }
    get(key) {
        const data = this.getAll();
        const value = data[key];
        this.remove(key);
        return value;
    }
    set(key, value) {
        const data = this.getAll();
        data[key] = value;
        return this.setAll(data);
    }
    getAll() {
        const state = this.parent.get(this.key);
        if (state === null) {
            return {};
        }
        return state;
    }
    setAll(data) {
        this.parent.set(this.key, data);
        return this;
    }
    has(key) {
        return key in this.getAll();
    }
    remove(key) {
        const data = this.getAll();
        delete data[key];
        this.setAll(data);
        return this;
    }
    clear() {
        return this.setAll({});
    }
}
