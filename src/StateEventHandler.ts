export class StateEventHandler {
	protected key: string;
	protected listeners: Array<ChangeEvent>;

	constructor(key: string) {
		this.key = key;
		this.listeners = [];
	}

	add(listener: ChangeEvent) {
		return this.listeners.push(listener) - 1;
	}

	remove(index: number) {
		this.listeners.splice(index, 1);
		return this;
	}

	call(value: any) {
		this.listeners.forEach((callback) => {
			callback(value, this);
		});
	}
}

export type ChangeEvent<T = any> = (
	value: T,
	thisArg: StateEventHandler
) => void;
