import { Startable } from 'startable';
export declare const START_TIMES_OUT = 3;
export declare const START_FAILED = 4;
export declare const SELF_STOP = 5;
export declare const STOP_TIMES_OUT = 6;
export declare const STOP_FAILED = 7;
export declare const SIGNAL_TIMES_OUT = 8;
export declare function adaptor(daemon: Startable, startTimeout?: number, stopTimeout?: number, signalTimeout?: number): void;
