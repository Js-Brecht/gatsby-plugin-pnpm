import path from "path";
import { Configuration, Options } from 'webpack';
import get from 'lodash.get';
import { createRequire } from './utils';

const FRAMEWORK_BUNDLES = [`react`, `react-dom`, `scheduler`, `prop-types`];

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

    const frameworkList: string[] = [];
    const frameworkRequire = createRequire(`${siteDirectory}/:internal:`);
    Object.assign(
        frameworkList,
        FRAMEWORK_BUNDLES
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

    const isRootDependency = (val?: string) => (
        frameworkList.some((f) => val?.startsWith(f))
    );
    framework.test = (mod) => {
        if (
            mod.rawRequest === `react-dom/server` ||
            mod.rawRequest?.includes(`/react-dom-server`)
        ) {
            return false;
        }
        return isRootDependency(mod.resource);
    };
};