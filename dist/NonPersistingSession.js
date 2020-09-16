export class NonPersistingSession {
    constructor(key) {
        this.key = key
            ? `non-persisting-${key}`
            : 'avidian-non-persisting-session-key';
        this.Storage = window.sessionStorage;
    }
    get(key) {
        return this.has(key) ? this.getAll()[key] : null;
    }
    getAll() {
        try {
            return JSON.parse(this.Storage.getItem(this.key) || '');
        }
        catch (error) {
            return {};
        }
    }
    set(key, value) {
        const data = this.getAll();
        data[key] = value;
        return this.setAll(data);
    }
    setAll(data) {
        this.Storage.setItem(this.key, JSON.stringify(data));
        return this;
    }
    remove(key) {
        const data = this.getAll();
        delete data[key];
        return this.setAll(data);
    }
    clear() {
        return this.setAll({});
    }
    has(key) {
        return key in this.getAll();
    }
}
