import { FlashStateContract } from './types/index';
import { Session } from './Session';
export declare class FlashSession implements FlashStateContract {
    key: string;
    parent: Session;
    constructor(session: Session);
    get(key: string): any;
    set(key: string, value: any): this;
    private getAll;
    private setAll;
    has(key: string): boolean;
    remove(key: string): this;
    clear(): this;
}
