export declare function limitTime(promise: Promise<void>, timeout?: number): Promise<void>;
export declare namespace limitTime {
    class TimeOut extends Error {
    }
}
