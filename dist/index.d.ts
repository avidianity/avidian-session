import SessionContract, { StateContract, ExpiringStateContract, FlashStateContract } from './types';
export declare class Session implements SessionContract {
    key: string;
    token_key: string;
    Storage: typeof window.localStorage;
    state: StateContract;
    temp: ExpiringSession;
    flash: FlashSession;
    [key: string]: any;
    constructor();
    start(): this;
    has(key: string): boolean;
    get(key: string): any;
    set(key: string, data: any): this;
    renew(clear?: boolean): this;
    getAll(): object;
    setAll(data: object): this;
    id(): string;
    clear(): this;
    remove(key: string): this;
    token(token?: string): this | string;
    revokeToken(): this;
    hasToken(): boolean;
    user(user?: any): any;
}
export declare class SessionException extends Error {
    constructor(message: string);
}
export declare class ExpiringSession implements ExpiringStateContract {
    id: string;
    key: string;
    parent: Session;
    constructor(parent: Session);
    getAll(): any;
    get(key: string): any;
    setAll(data: any): this;
    set(key: string, value: any, minutes: number): this;
    remove(key: string): this;
    clear(): this;
    has(key: string): boolean;
    renew(clear?: boolean): this;
}
export declare class FlashSession implements FlashStateContract {
    key: string;
    parent: Session;
    constructor(session: Session);
    get(key: string): any;
    set(key: string, value: any): this;
    getAll(): any;
    setAll(data: any): this;
    has(key: string): boolean;
    remove(key: string): this;
    clear(): this;
}
declare const _default: {
    install(Vue: any, options?: any): void;
};
export default _default;
