/// <reference types="node" />
import { Stats, realpath as _realpath } from 'fs';
export declare const realpath: typeof _realpath.__promisify__;
export declare const fileExists: (filepath: string) => Promise<void | Stats>;
export declare const isDir: (pathname: string) => Promise<Boolean>;
export declare const walkBack: (startPath: string) => Promise<string | void>;
