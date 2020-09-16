export class SessionException extends Error {
	[key: string]: any;
	constructor(message: string) {
		super(message);
	}
	toJSON(): string {
		return JSON.stringify(this.toObject());
	}
	toObject(): object {
		const data: { [key: string]: any } = {};
		Object.keys(this).forEach((key) => {
			data[key] = this[key];
		});
		return data;
	}
}
