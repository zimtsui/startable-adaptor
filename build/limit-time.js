"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.limitTime = void 0;
function limitTime(promise, timeout = Number.POSITIVE_INFINITY) {
    if (timeout === Number.POSITIVE_INFINITY)
        return promise;
    return new Promise((resolve, reject) => {
        promise.then(resolve, reject);
        setTimeout(() => reject(new limitTime.TimeOut()), timeout).unref();
    });
}
exports.limitTime = limitTime;
(function (limitTime) {
    class TimeOut extends Error {
    }
    limitTime.TimeOut = TimeOut;
})(limitTime = exports.limitTime || (exports.limitTime = {}));
//# sourceMappingURL=limit-time.js.map