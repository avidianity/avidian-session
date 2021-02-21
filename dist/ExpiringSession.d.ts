import { Session } from './Session';
export declare class ExpiringSession {
    id: string;
    key: string;
    parent: Session;
    constructor(parent: Session);
    private getAll;
    get(key: string): any;
    private setAll;
    set(key: string, value: any, minutes: number): this;
    remove(key: string): this;
    clear(): this;
    has(key: string): boolean;
    renew(clear?: boolean): this;
}
