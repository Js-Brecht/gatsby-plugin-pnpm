import * as path from 'path';
import { stat as _stat, Stats, realpath as _realpath } from 'fs';
import { promisify } from 'util';

const stat = promisify(_stat);
export const realpath = promisify(_realpath);

export const fileExists = async (filepath: string): Promise<Stats | void> => {
    return new Promise((resolve) => {
        _stat(filepath, (err, fileStats) => {
            if (err) {
                return resolve();
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

export const walkBack = async (startPath: string): Promise<string> => {
    let procPath = path.resolve(startPath);
    let lastProcPath = '';
    while (procPath.length > 0) {
        if (path.basename(procPath) === 'node_modules' && await isDir(procPath)) return procPath;
        procPath = path.resolve(procPath, '..');
        if (procPath === lastProcPath) break; // Can't go back any further
        lastProcPath = procPath;
    }
    return '';
};

type IGetPkgNodeModules = (args: {
    pkgName: string;
    nodeModules: string;
    strict: boolean;
}) => Promise<string>;
export const getPkgNodeModules: IGetPkgNodeModules = async ({
    pkgName,
    nodeModules,
    strict,
}) => {
    try {
        const pkgPath = strict ?
        // We need to check if the option is a valid dependency of the
        // current project
            path.join(nodeModules, pkgName) :
            // Or we need to let node resolve it
            require.resolve(pkgName, {
                paths: [
                    nodeModules,
                ],
            });
        if (await fileExists(pkgPath)) {
            try {
                const nodePath = path.join(
                    await walkBack(strict ? await realpath(pkgPath) : pkgPath),
                );
                return nodePath;
            } catch (err) {
                // noop
            }
        }
    } catch (err) {
        // noop
    }
    return '';
};