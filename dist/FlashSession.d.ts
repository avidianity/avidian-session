import { Session } from './Session';
export declare class FlashSession {
    key: string;
    parent: Session;
    constructor(session: Session);
    get<T = any>(key: string): T;
    set(key: string, value: any): this;
    private getAll;
    private setAll;
    has(key: string): boolean;
    remove(key: string): this;
    clear(): this;
}
