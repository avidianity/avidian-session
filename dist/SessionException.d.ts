export declare class SessionException extends Error {
    [key: string]: any;
    constructor(message: string);
    toJSON(): string;
    toObject(): object;
}
