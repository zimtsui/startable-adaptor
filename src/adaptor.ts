import { Startable } from 'startable';

export const START_TIMES_OUT = 3;
export const START_FAILED = 4;
export const INTERNAL_EXCEPTION = 5;
export const STOP_TIMES_OUT = 6;
export const STOP_FAILED = 7;
export const SIGNAL_TIMES_OUT = 8;

export function adaptor(
    daemon: Startable,
    startTimeout = 0,
    stopTimeout = 0,
    signalTimeout = 0,
) {
    let startTimer: ReturnType<typeof setTimeout> | null = null;
    if (startTimeout)
        startTimer = setTimeout(
            () => void process.exit(START_TIMES_OUT),
            startTimeout,
        );
    console.log('Starting...');
    daemon.start(err => {
        console.log('Stopping...');
        if (err) {
            console.error(err);
            process.exitCode = INTERNAL_EXCEPTION;
        }
        if (stopTimeout) setTimeout(
            () => {
                console.log('Stopping times out.')
                process.exit(STOP_TIMES_OUT);
            },
            stopTimeout,
        ).unref();
        daemon.stop().then(() => {
            console.log('Stopped.')
        }).catch(err => {
            // 必不是啊
            console.error(err);
            console.log('Failed to stop.');
            process.exitCode = STOP_FAILED;
        });
    }).finally(() => {
        if (startTimeout) clearTimeout(startTimer!);
    }).then(() => {
        console.log('Started.');
    }).catch(err => {
        console.error(err);
        console.log('Failed to start.')
        process.exitCode = START_FAILED;
        daemon.stop();
    });

    function onSignal() {
        daemon.stop().catch(console.error);
        if (signalTimeout) setTimeout(
            () => {
                console.log('Times out since signal.')
                process.exit(SIGNAL_TIMES_OUT);
            },
            signalTimeout,
        ).unref();
    }
    process.once('SIGINT', () => {
        process.once('SIGINT', () => void process.exit(128 + 2));
        onSignal();
    });
    process.on('SIGTERM', onSignal);
}
