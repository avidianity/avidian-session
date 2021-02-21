import { ExpiringStateContract, SessionContract } from './types/index';
export declare class ExpiringSession implements ExpiringStateContract {
    id: string;
    key: string;
    parent: SessionContract;
    constructor(parent: SessionContract);
    private getAll;
    get(key: string): any;
    private setAll;
    set(key: string, value: any, minutes: number): this;
    remove(key: string): this;
    clear(): this;
    has(key: string): boolean;
    renew(clear?: boolean): this;
}
