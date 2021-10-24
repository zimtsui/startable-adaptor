import {
    StopDuringStarting,
    Startable,
} from 'startable';

export const START_TIMES_OUT = 3;
export const START_FAILED = 4;
export const SELF_STOP = 5;
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
    daemon.start(err => {
        if (err) {
            console.error(err);
            process.exitCode = SELF_STOP;
        }
        if (stopTimeout) setTimeout(
            () => void process.exit(STOP_TIMES_OUT),
            stopTimeout,
        ).unref();
        daemon.stop().catch(err => {
            if (!(err instanceof StopDuringStarting)) {
                console.error(err);
                process.exitCode = STOP_FAILED;
            }
        });
    }).finally(() => {
        if (startTimeout) clearTimeout(startTimer!);
    }).catch(err => {
        console.error(err);
        process.exitCode = START_FAILED;
        daemon.stop();
    });

    function onSignal() {
        daemon.stop();
        if (signalTimeout) setTimeout(
            () => void process.exit(SIGNAL_TIMES_OUT),
            signalTimeout,
        ).unref();
    }
    process.once('SIGINT', () => {
        process.once('SIGINT', () => void process.exit(128 + 2));
        onSignal();
    });
    process.on('SIGTERM', onSignal);
}
