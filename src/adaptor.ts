import { Startable } from '@zimtsui/startable';
import { limitTime } from './limit-time';

export const EXIT_FAILURE = 1;
export const EXIT_SIGINT = 128 + 2;



export async function adapt(
	startable: Startable,
	startTimeout = Number.POSITIVE_INFINITY,
	stopTimeout = Number.POSITIVE_INFINITY,
) {
	function onSignal(signal: 'SIGINT' | 'SIGTERM') {
		startable.stop();
	}
	process.once('SIGINT', () => {
		process.once('SIGINT', () => void process.exit(EXIT_SIGINT));
		onSignal('SIGINT');
	});
	process.on('SIGTERM', onSignal);


	try {
		console.log(`STARTING.`);
		await limitTime(startable.start(async err => {
			if (err) {
				console.error(err);
				process.exitCode = EXIT_FAILURE;
			}
			console.log(`STOPPING.`);
			try {
				await limitTime(startable.stop(), stopTimeout);
			} catch (err) {
				if (err instanceof limitTime.TimeOut) {
					console.log(`STOPPING times out.`);
					process.exit(EXIT_FAILURE);
				} else {
					console.error(err);
					console.log(`STOPPING failed.`);
					process.exitCode = EXIT_FAILURE;
				}
			}
			console.log(`STOPPED.`);
		}), startTimeout);
		console.log(`STARTED.`);
	} catch (err) {
		if (err instanceof limitTime.TimeOut) {
			console.log(`STARTING times out.`)
			process.exit(EXIT_FAILURE);
		} else {
			console.error(err);
			console.log(`STARTING failed.`);
			process.exitCode = EXIT_FAILURE;
			await startable.stop();
		}
	}
}
