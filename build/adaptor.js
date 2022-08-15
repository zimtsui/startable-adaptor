"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adapt = exports.PROCESS_TIMES_OUT = exports.SIGNAL_TIMES_OUT = exports.STOPING_FAILED = exports.STOPPING_TIMES_OUT = exports.EXCEPTION_DURING_RUNNING = exports.STARTING_FAILED = exports.STARTING_TIMES_OUT = void 0;
const limit_time_1 = require("./limit-time");
exports.STARTING_TIMES_OUT = 3;
exports.STARTING_FAILED = 4;
exports.EXCEPTION_DURING_RUNNING = 5;
exports.STOPPING_TIMES_OUT = 6;
exports.STOPING_FAILED = 7;
exports.SIGNAL_TIMES_OUT = 8;
exports.PROCESS_TIMES_OUT = 9;
const prefix = '[Startable adaptor]';
async function adapt(startable, startTimeout = 0, stopTimeout = 0, signalTimeout = 0) {
    function onSignal(signal) {
        startable.stop();
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
    try {
        console.log(`${prefix} Starting.`);
        await (0, limit_time_1.limitTime)(Promise.resolve(startable.start()), startTimeout, () => {
            console.error(`${prefix} Starting times out.`);
            process.exit(exports.STARTING_TIMES_OUT);
        });
        console.log(`${prefix} Started.`);
    }
    catch (err) {
        console.log(`${prefix} Failed to start.`);
        console.error(err);
        process.exitCode = exports.STARTING_FAILED;
        startable.stop();
    }
    finally {
        startable.start(async (err) => {
            if (err) {
                console.log(`${prefix} Stopping due to an exception.`);
                console.error(err);
                process.exitCode = exports.EXCEPTION_DURING_RUNNING;
            }
            else
                console.log(`${prefix} Stopping.`);
            if (stopTimeout)
                setTimeout(() => {
                    console.error(`${prefix} Process times out.`);
                    process.exit(exports.PROCESS_TIMES_OUT);
                }, stopTimeout).unref();
            try {
                await (0, limit_time_1.limitTime)(startable.stop(), stopTimeout, () => {
                    console.error(`${prefix} Stopping times out.`);
                    process.exit(exports.STOPPING_TIMES_OUT);
                });
                console.log(`${prefix} Stopped.`);
            }
            catch (err) {
                console.error(`${prefix} Failed to stop.`);
                console.error(err);
                process.exitCode = exports.STOPING_FAILED;
            }
        });
    }
}
exports.adapt = adapt;
//# sourceMappingURL=adaptor.js.map