export async function limitTime(
	promise: Promise<void>,
	timeout: number,
	cb: () => void,
) {
	try {
		await new Promise<void>((resolve, reject) => {
			promise.then(resolve, reject);
			if (timeout) setTimeout(
				() => reject(new TimeOut()),
			).unref();
		});
	} catch (err) {
		if (err instanceof TimeOut) cb();
		throw err;
	}
}

export class TimeOut extends Error { }
