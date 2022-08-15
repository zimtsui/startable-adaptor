import { Startable } from 'startable';
export declare const STARTING_TIMES_OUT = 3;
export declare const STARTING_FAILED = 4;
export declare const EXCEPTION_DURING_RUNNING = 5;
export declare const STOPPING_TIMES_OUT = 6;
export declare const STOPING_FAILED = 7;
export declare const SIGNAL_TIMES_OUT = 8;
export declare const PROCESS_TIMES_OUT = 9;
export declare function adapt(startable: Startable, startTimeout?: number, stopTimeout?: number, signalTimeout?: number): Promise<void>;
