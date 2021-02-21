import { FlashStateContract, SessionContract } from './types/index';
export declare class FlashSession implements FlashStateContract {
    key: string;
    parent: SessionContract;
    constructor(session: SessionContract);
    get<T = any>(key: string): T;
    set(key: string, value: any): this;
    private getAll;
    private setAll;
    has(key: string): boolean;
    remove(key: string): this;
    clear(): this;
}
