import { Startable } from 'startable';
import { limitTime } from './limit-time';


export const STARTING_TIMES_OUT = 3;
export const STARTING_FAILED = 4;
export const EXCEPTION_DURING_RUNNING = 5;
export const STOPPING_TIMES_OUT = 6;
export const STOPING_FAILED = 7;
export const SIGNAL_TIMES_OUT = 8;
export const PROCESS_TIMES_OUT = 9;

const prefix = '[Startable adaptor]';



export async function adapt(
	startable: Startable,
	startTimeout = 0,
	stopTimeout = 0,
	signalTimeout = 0,
) {
	function onSignal(signal: 'SIGINT' | 'SIGTERM') {
		startable.stop();
		if (signalTimeout) setTimeout(
			() => {
				console.error(`Times out since ${signal}.`)
				process.exit(SIGNAL_TIMES_OUT);
			},
			signalTimeout,
		).unref();
	}
	process.once('SIGINT', () => {
		process.once('SIGINT', () => void process.exit(128 + 2));
		onSignal('SIGINT');
	});
	process.on('SIGTERM', onSignal);


	try {
		console.log(`${prefix} Starting.`);
		await limitTime(
			Promise.resolve(startable.start()),
			startTimeout,
			() => {
				console.error(`${prefix} Starting times out.`)
				process.exit(STARTING_TIMES_OUT);
			}
		);
		console.log(`${prefix} Started.`);
	} catch (err) {
		console.log(`${prefix} Failed to start.`);
		console.error(err);
		process.exitCode = STARTING_FAILED;
		startable.stop();
	} finally {
		startable.start(async err => {
			if (err) {
				console.log(`${prefix} Stopping due to an exception.`);
				console.error(err);
				process.exitCode = EXCEPTION_DURING_RUNNING;
			} else console.log(`${prefix} Stopping.`);

			if (stopTimeout) setTimeout(() => {
				console.error(`${prefix} Process times out.`);
				process.exit(PROCESS_TIMES_OUT);
			}, stopTimeout).unref();

			try {
				await limitTime(
					startable.stop(),
					stopTimeout,
					() => {
						console.error(`${prefix} Stopping times out.`);
						process.exit(STOPPING_TIMES_OUT);
					},
				);
				console.log(`${prefix} Stopped.`);
			} catch (err) {
				console.error(`${prefix} Failed to stop.`);
				console.error(err);
				process.exitCode = STOPING_FAILED;
			}
		});
	}
}
