export class StateEventHandler {
    constructor(key) {
        this.key = key;
        this.listeners = [];
    }
    add(listener) {
        return this.listeners.push(listener) - 1;
    }
    remove(index) {
        this.listeners.splice(index, 1);
        return this;
    }
    call(value) {
        this.listeners.forEach((callback) => {
            callback(value, this);
        });
    }
}
