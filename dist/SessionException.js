export class SessionException extends Error {
    constructor(message) {
        super(message);
    }
    toJSON() {
        return JSON.stringify(this.toObject());
    }
    toObject() {
        const data = {};
        Object.keys(this).forEach((key) => {
            data[key] = this[key];
        });
        return data;
    }
}
