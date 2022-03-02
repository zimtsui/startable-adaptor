"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adapt = exports.PROCESS_TIMES_OUT = exports.SIGNAL_TIMES_OUT = exports.STOPING_FAILED = exports.STOPPING_TIMES_OUT = exports.EXCEPTION_DURING_RUNNING = exports.STARTING_FAILED = exports.STARTING_TIMES_OUT = void 0;
exports.STARTING_TIMES_OUT = 3;
exports.STARTING_FAILED = 4;
exports.EXCEPTION_DURING_RUNNING = 5;
exports.STOPPING_TIMES_OUT = 6;
exports.STOPING_FAILED = 7;
exports.SIGNAL_TIMES_OUT = 8;
exports.PROCESS_TIMES_OUT = 9;
function adapt(daemon, startTimeout = 0, stopTimeout = 0, signalTimeout = 0) {
    const startTimer = startTimeout
        ? setTimeout(() => {
            console.error('Starting times out.');
            process.exit(exports.STARTING_TIMES_OUT);
        }, startTimeout)
        : null;
    console.log('Starting...');
    daemon.start(err => {
        if (err) {
            console.log('Stopping due to an exception...');
            console.error(err);
            process.exitCode = exports.EXCEPTION_DURING_RUNNING;
        }
        else
            console.log('Stopping...');
        if (stopTimeout)
            setTimeout(() => {
                if (daemon.getReadyState() === "STOPPING" /* STOPPING */) {
                    console.error('Stopping times out.');
                    process.exit(exports.STOPPING_TIMES_OUT);
                }
                else {
                    console.error('Stopped but process times out.');
                    process.exit(exports.PROCESS_TIMES_OUT);
                }
            }, stopTimeout).unref();
        daemon.stop().then(() => {
            console.log('Stopped.');
        }, err => {
            console.error('Failed to stop.');
            console.error(err);
            process.exitCode = exports.STOPING_FAILED;
        });
    }).finally(() => {
        if (startTimer !== null)
            clearTimeout(startTimer);
    }).then(() => {
        console.log('Started.');
    }, err => {
        console.error(err);
        console.log('Failed to start.');
        process.exitCode = exports.STARTING_FAILED;
        daemon.stop();
    });
    function onSignal(signal) {
        daemon.stop();
        if (signalTimeout)
            setTimeout(() => {
                console.error(`Times out since ${signal}.`);
                process.exit(exports.SIGNAL_TIMES_OUT);
            }, signalTimeout).unref();
    }
    process.once('SIGINT', () => {
        process.once('SIGINT', () => void process.exit(128 + 2));
        onSignal('SIGINT');
    });
    process.on('SIGTERM', onSignal);
}
exports.adapt = adapt;
//# sourceMappingURL=adaptor.js.map