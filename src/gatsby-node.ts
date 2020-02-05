import * as path from 'path';
import { Configuration } from 'webpack';
import { GatsbyNode, CreateWebpackConfigArgs, PluginOptions } from 'gatsby';
import { realpath, isDir, fileExists, walkBack } from './utils';

interface IPnpmOptions extends PluginOptions {
    include: string[];
}

/**
 * Adds settings to the webpack configuration so that it will be able to resolve modules
 * installed using `pnpm`
 * @param {CreateWebpackConfigArgs} config The configuration options that are passed in by
 * `gatsby`.
 * @param {IPnpmOptions} options The options provided by the user in `gatsby-config`.
 *
 * Available options are:
 *
 * | Option  | Description |
 * |:--------|:------------|
 * | include | a list of package names and/or paths that you would like to be made available to Webpack.  Each of these should either be the name of one of your project's direct dependencies, or a path to a folder containing packages that can be resolved as a module.|
 */
export const onCreateWebpackConfig: GatsbyNode['onCreateWebpackConfig'] = async ({ actions, reporter }: CreateWebpackConfigArgs, options: IPnpmOptions): Promise<void> => {
    const { setWebpackConfig } = actions;
    const nodeModules = path.join(process.cwd(), 'node_modules');
    const pnpmNodeModules = path.join(nodeModules, '.pnpm', 'node_modules');
    const gatsbyNodeModules = await walkBack(await realpath(path.join(nodeModules, 'gatsby')));

    if (!gatsbyNodeModules) {
        return reporter.panic("[gatsby-plugin-pnpm] Unable to resolve your Gatsby install's real path!!");
    }

    const modulePaths: string[] = [
        'node_modules',
        nodeModules,
        gatsbyNodeModules,
        pnpmNodeModules,
    ];

    if (options.resolutions) {
        for (const pkgName of options.include) {
            // If the defined package name option is a directory, then resolve its realpath and
            // load it directly
            if (await isDir(pkgName)) {
                modulePaths.push(await realpath(path.resolve(pkgName)));
            } else {
                // We need to check if the option is a valid dependency of the
                // current project
                const pkgPath = path.resolve(path.join(nodeModules, pkgName));
                // If the resolved package name exists in the current project's
                // node_modules, then push its realpath.
                if (await fileExists(pkgPath)) {
                    const nodePath = await walkBack(await realpath(pkgPath));
                    if (nodePath) modulePaths.push(nodePath);
                    if (!nodePath) {
                        reporter.warn(`[gatsby-plugin-pnpm] Unable to locate dependency ${pkgName}'s node_modules from its real path`);
                    }
                }
            }
        }
    }

    const config: Configuration = {
        resolve: {
            modules: modulePaths,
        },
        resolveLoader: {
            modules: modulePaths,
        },
    };

    setWebpackConfig(config);
};