"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeOut = exports.limitTime = void 0;
async function limitTime(promise, timeout, cb) {
    try {
        await new Promise((resolve, reject) => {
            promise.then(resolve, reject);
            if (timeout)
                setTimeout(() => reject(new TimeOut())).unref();
        });
    }
    catch (err) {
        if (err instanceof TimeOut)
            cb();
        throw err;
    }
}
exports.limitTime = limitTime;
class TimeOut extends Error {
}
exports.TimeOut = TimeOut;
//# sourceMappingURL=limit-time.js.map