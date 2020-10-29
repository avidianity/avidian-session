export declare class StateEventHandler {
    protected key: string;
    protected listeners: Array<ChangeEvent>;
    constructor(key: string);
    add(listener: ChangeEvent): number;
    remove(index: number): this;
    call(value: any): void;
}
export declare type ChangeEvent<T = any> = (value: T, thisArg: StateEventHandler) => void;
