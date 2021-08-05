import path from "path";
import { Configuration, Options } from 'webpack';
import get from 'lodash.get';
import { createRequire } from './utils';

/**
 * Fix missing framework in development.
 * See https://github.com/Js-Brecht/gatsby-plugin-pnpm/issues/8
 */
export const fixFrameworkCache = (config: Configuration, siteDirectory: string) => {
    const framework = (
        get(config, "optimization.splitChunks.cacheGroups.framework", false)
    ) as Options.CacheGroupsOptions | boolean;

    if (!framework) return;
    if (typeof framework !== "object" || !framework.test) return;
    if (!(framework.test instanceof RegExp)) return;

    const regVal = framework.test
        .toString()
        .replace(/[[\\\]]/g, "")
        .slice(1, -1);
    const frameworkPackages = /\/\(([^)]+)\)\/$/.exec(regVal);
    const frameworkList: string[] = [];

    if (frameworkPackages) {
        const frameworkRequire = createRequire(`${siteDirectory}/:internal:`);
        Object.assign(
            frameworkList,
            frameworkPackages[1]
                .split("|")
                .map((f) => {
                    try {
                        return path.dirname(
                            frameworkRequire.resolve(`${f}/package.json`),
                        ) + path.sep;
                    } catch (err) {
                        return "";
                    }
                })
                .filter(Boolean),
        );
    }

    const isRootDependency = (val?: string) => (
        frameworkList.some((f) => val?.startsWith(f))
    );
    framework.test = (mod) => (
        isRootDependency(mod.resource)
    );
};