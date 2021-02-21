export declare class NonPersistingSession {
    key: string;
    Storage: typeof window.sessionStorage;
    constructor(key?: string);
    get(key: string): any;
    private getAll;
    set(key: string, value: any): this;
    private setAll;
    remove(key: string): this;
    clear(): this;
    has(key: string): boolean;
}
