export function limitTime(
	promise: Promise<void>,
	timeout: number = Number.POSITIVE_INFINITY,
): Promise<void> {
	if (timeout === Number.POSITIVE_INFINITY) return promise;

	return new Promise<void>((resolve, reject) => {
		promise.then(resolve, reject);
		setTimeout(() => reject(new limitTime.TimeOut()), timeout).unref();
	});
}

export namespace limitTime {
	export class TimeOut extends Error { }
}
