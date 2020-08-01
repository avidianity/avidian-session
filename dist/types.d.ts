export interface StateContract {
    [key: string]: any;
}
export default interface SessionContract {
    key: string;
    Storage: typeof window.localStorage;
    start(): this;
    has(key: string): boolean;
    get(key: string): any;
    set(key: string, data: any): this;
    renew(clear: boolean): this;
    id(): string;
    clear(): this;
    clearAll(): this;
    remove(key: string): this;
    token(token?: string, remember?: boolean): this | string | null;
    revokeToken(): this;
    hasToken(): boolean;
    user(user?: any, remember?: boolean): any;
    removeUser(): this;
}
export interface ExpiringStateContract {
    id: string;
    key: string;
    parent: SessionContract;
    get(key: string): any;
    set(key: string, value: any, minutes: number): this;
    remove(key: string): this;
    clear(): this;
    has(key: string): boolean;
    renew(clear: boolean): this;
}
export interface ExpiryContract {
    value: any;
    expiry: number;
}
export interface FlashStateContract {
    key: string;
    parent: SessionContract;
    get(key: string): any;
    set(key: string, value: any): this;
    remove(key: string): this;
    clear(): this;
    has(key: string): boolean;
}
export interface NonPersistingStateContract {
    key: string;
    Storage: typeof window.sessionStorage;
    get(key: string): any;
    set(key: string, value: any): this;
    remove(key: string): this;
    clear(): this;
    has(key: string): boolean;
}
