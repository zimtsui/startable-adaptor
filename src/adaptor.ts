import { Startable, ReadyState } from 'startable';

export const STARTING_TIMES_OUT = 3;
export const STARTING_FAILED = 4;
export const EXCEPTION_DURING_RUNNING = 5;
export const STOPPING_TIMES_OUT = 6;
export const STOPING_FAILED = 7;
export const SIGNAL_TIMES_OUT = 8;
export const PROCESS_TIMES_OUT = 9;

export function adapt(
	daemon: Startable,
	startTimeout = 0,
	stopTimeout = 0,
	signalTimeout = 0,
) {
	const startTimer: ReturnType<typeof setTimeout> | null = startTimeout
		? setTimeout(() => {
			console.error('Starting times out.')
			process.exit(STARTING_TIMES_OUT);
		}, startTimeout)
		: null;
	console.log('Starting...');
	daemon.start(err => {
		if (err) {
			console.log('Stopping due to an exception...');
			console.error(err);
			process.exitCode = EXCEPTION_DURING_RUNNING;
		} else console.log('Stopping...');

		if (stopTimeout) setTimeout(
			() => {
				if (daemon.readyState === ReadyState.STOPPING) {
					console.error('Stopping times out.');
					process.exit(STOPPING_TIMES_OUT);
				} else {
					console.error('Stopped but process times out.');
					process.exit(PROCESS_TIMES_OUT);
				}
			},
			stopTimeout,
		).unref();

		daemon.stop().then(() => {
			console.log('Stopped.')
		}, err => {
			console.error('Failed to stop.');
			console.error(err);
			process.exitCode = STOPING_FAILED;
		});
	}).finally(() => {
		if (startTimer !== null) clearTimeout(startTimer!);
	}).then(() => {
		console.log('Started.');
	}, err => {
		console.error(err);
		console.log('Failed to start.')
		process.exitCode = STARTING_FAILED;
		daemon.stop();
	});

	function onSignal(signal: 'SIGINT' | 'SIGTERM') {
		daemon.stop();
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
}
