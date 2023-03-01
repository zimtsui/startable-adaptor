import { Startable } from '@zimtsui/startable';
export declare const EXIT_FAILURE = 1;
export declare const EXIT_SIGINT: number;
export declare function adapt(startable: Startable, startTimeout?: number, stopTimeout?: number): Promise<void>;
