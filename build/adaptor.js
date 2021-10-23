"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adaptor = void 0;
const startable_1 = require("startable");
function adaptor(daemon, startTimeout = 0, stopTimeout = 0) {
    let startTimer = null;
    if (startTimeout)
        startTimer = setTimeout(() => void process.exit(3), startTimeout);
    daemon.start(err => {
        if (err) {
            console.error(err);
            process.exitCode = 4;
        }
        if (stopTimeout)
            setTimeout(() => void process.exit(5), stopTimeout).unref();
        daemon.stop().catch(err => {
            if (err instanceof startable_1.StopDuringStarting)
                daemon.start().catch(() => daemon.stop());
            else {
                console.error(err);
                process.exitCode = 5;
            }
        });
    }).finally(() => {
        if (startTimeout)
            clearTimeout(startTimer);
    }).catch(err => {
        console.error(err);
        process.exitCode = 3;
        daemon.stop();
    });
    function stopDaemon() {
        daemon.stop().catch(err => {
            if (err instanceof startable_1.StopDuringStarting)
                daemon.start().catch(() => daemon.stop());
        });
    }
    process.once('SIGINT', () => {
        process.once('SIGINT', () => void process.exit(128 + 2));
        stopDaemon();
    });
    process.on('SIGTERM', () => {
        stopDaemon();
    });
}
exports.adaptor = adaptor;
//# sourceMappingURL=adaptor.js.map