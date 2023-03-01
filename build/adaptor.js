"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adapt = exports.EXIT_SIGINT = exports.EXIT_FAILURE = void 0;
const limit_time_1 = require("./limit-time");
exports.EXIT_FAILURE = 1;
exports.EXIT_SIGINT = 128 + 2;
async function adapt(startable, startTimeout = Number.POSITIVE_INFINITY, stopTimeout = Number.POSITIVE_INFINITY) {
    function onSignal(signal) {
        startable.stop();
    }
    process.once('SIGINT', () => {
        process.once('SIGINT', () => void process.exit(exports.EXIT_SIGINT));
        onSignal('SIGINT');
    });
    process.on('SIGTERM', onSignal);
    try {
        console.log(`STARTING.`);
        await (0, limit_time_1.limitTime)(startable.start(async (err) => {
            if (err) {
                console.error(err);
                process.exitCode = exports.EXIT_FAILURE;
            }
            console.log(`STOPPING.`);
            try {
                await (0, limit_time_1.limitTime)(startable.stop(), stopTimeout);
            }
            catch (err) {
                if (err instanceof limit_time_1.limitTime.TimeOut) {
                    console.log(`STOPPING times out.`);
                    process.exit(exports.EXIT_FAILURE);
                }
                else {
                    console.error(err);
                    console.log(`STOPPING failed.`);
                    process.exitCode = exports.EXIT_FAILURE;
                }
            }
            console.log(`STOPPED.`);
        }), startTimeout);
        console.log(`STARTED.`);
    }
    catch (err) {
        if (err instanceof limit_time_1.limitTime.TimeOut) {
            console.log(`STARTING times out.`);
            process.exit(exports.EXIT_FAILURE);
        }
        else {
            console.error(err);
            console.log(`STARTING failed.`);
            process.exitCode = exports.EXIT_FAILURE;
            await startable.stop();
        }
    }
}
exports.adapt = adapt;
//# sourceMappingURL=adaptor.js.map