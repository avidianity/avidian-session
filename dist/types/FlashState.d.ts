import { Session as SessionContract } from './Session';
export interface FlashState {
    key: string;
    parent: SessionContract;
    get(key: string): any;
    set(key: string, value: any): this;
    remove(key: string): this;
    clear(): this;
    has(key: string): boolean;
}
