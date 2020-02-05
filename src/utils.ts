import * as path from 'path';
import { stat as _stat, Stats, realpath as _realpath } from 'fs';
import { promisify } from 'util';

const stat = promisify(_stat);
export const realpath = promisify(_realpath);

export const fileExists = async (filepath: string): Promise<Stats | void> => {
    return new Promise((resolve, reject) => {
        _stat(filepath, (err, fileStats) => {
            if (err) {
                return reject();
            }
            resolve(fileStats);
        });
    });
};

export const isDir = async (pathname: string): Promise<Boolean> => {
    try {
        const fsStat = await stat(pathname);
        return fsStat.isDirectory();
    } catch (err) {
        //noop
    }
    return false;
};

export const walkBack = async (startPath: string): Promise<string | void> => {
    let procPath = path.resolve(startPath);
    let lastProcPath = '';
    while (procPath.length > 0) {
        if (path.basename(procPath) === 'node_modules' && await isDir(procPath)) return procPath;
        procPath = path.resolve(procPath, '..');
        if (procPath === lastProcPath) break; // Can't go back any further
        lastProcPath = procPath;
    }
};