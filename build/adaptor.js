"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adaptor = exports.SIGNAL_TIMES_OUT = exports.STOP_FAILED = exports.STOP_TIMES_OUT = exports.SELF_STOP = exports.START_FAILED = exports.START_TIMES_OUT = void 0;
const startable_1 = require("startable");
exports.START_TIMES_OUT = 3;
exports.START_FAILED = 4;
exports.SELF_STOP = 5;
exports.STOP_TIMES_OUT = 6;
exports.STOP_FAILED = 7;
exports.SIGNAL_TIMES_OUT = 8;
function adaptor(daemon, startTimeout = 0, stopTimeout = 0, signalTimeout = 0) {
    let startTimer = null;
    if (startTimeout)
        startTimer = setTimeout(() => void process.exit(exports.START_TIMES_OUT), startTimeout);
    daemon.start(err => {
        if (err) {
            console.error(err);
            process.exitCode = exports.SELF_STOP;
        }
        if (stopTimeout)
            setTimeout(() => void process.exit(exports.STOP_TIMES_OUT), stopTimeout).unref();
        daemon.stop().catch(err => {
            if (!(err instanceof startable_1.StopDuringStarting)) {
                console.error(err);
                process.exitCode = exports.STOP_FAILED;
            }
        });
    }).finally(() => {
        if (startTimeout)
            clearTimeout(startTimer);
    }).catch(err => {
        console.error(err);
        process.exitCode = exports.START_FAILED;
        daemon.stop();
    });
    function onSignal() {
        daemon.stop();
        if (signalTimeout)
            setTimeout(() => void process.exit(exports.SIGNAL_TIMES_OUT), signalTimeout).unref();
    }
    process.once('SIGINT', () => {
        process.once('SIGINT', () => void process.exit(128 + 2));
        onSignal();
    });
    process.on('SIGTERM', onSignal);
}
exports.adaptor = adaptor;
//# sourceMappingURL=adaptor.js.map