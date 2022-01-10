"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adapt = exports.SIGNAL_TIMES_OUT = exports.STOP_FAILED = exports.STOP_TIMES_OUT = exports.INTERNAL_EXCEPTION = exports.START_FAILED = exports.START_TIMES_OUT = void 0;
exports.START_TIMES_OUT = 3;
exports.START_FAILED = 4;
exports.INTERNAL_EXCEPTION = 5;
exports.STOP_TIMES_OUT = 6;
exports.STOP_FAILED = 7;
exports.SIGNAL_TIMES_OUT = 8;
function adapt(daemon, startTimeout = 0, stopTimeout = 0, signalTimeout = 0) {
    const startTimer = startTimeout
        ? setTimeout(() => void process.exit(exports.START_TIMES_OUT), startTimeout) : null;
    console.log('Starting...');
    daemon.start(err => {
        console.log('Stopping...');
        if (err) {
            console.error(err);
            process.exitCode = exports.INTERNAL_EXCEPTION;
        }
        if (stopTimeout)
            setTimeout(() => {
                console.log('Stopping times out.');
                process.exit(exports.STOP_TIMES_OUT);
            }, stopTimeout).unref();
        daemon.stop().then(() => {
            console.log('Stopped.');
        }).catch(err => {
            console.error(err);
            console.log('Failed to stop.');
            process.exitCode = exports.STOP_FAILED;
        });
    }).finally(() => {
        if (startTimer !== null)
            clearTimeout(startTimer);
    }).then(() => {
        console.log('Started.');
    }).catch(err => {
        console.error(err);
        console.log('Failed to start.');
        process.exitCode = exports.START_FAILED;
        daemon.stop();
    });
    function onSignal(signal) {
        daemon.stop();
        if (signalTimeout)
            setTimeout(() => {
                console.log(`Times out since ${signal}.`);
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