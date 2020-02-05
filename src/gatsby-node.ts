import * as path from 'path';
import { Configuration } from 'webpack';
import { GatsbyNode, CreateWebpackConfigArgs, PluginOptions } from 'gatsby';
import { realpath, isDir, fileExists } from './utils';

interface IPnpmOptions extends PluginOptions {
    packages: string[];
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
 * | Option    | Description |
 * |:----------|:------------|
 * | packages  |a list of package names and/or paths that you would like to be made available to Webpack.  Each of these should either be the name of one of your project's direct dependencies, or a path to a folder containing packages that can be resolved as a module.|
 */
export const onCreateWebpackConfig: GatsbyNode['onCreateWebpackConfig'] = async ({ actions }: CreateWebpackConfigArgs, options: IPnpmOptions): Promise<void> => {
    const { setWebpackConfig } = actions;
    const nodeModules = path.join(process.cwd(), 'node_modules');
    const pnpmNodeModules = path.join(nodeModules, '.pnpm', 'node_modules');
    const gatsbyNodeModules = path.dirname(await realpath(path.join(nodeModules, 'gatsby')));

    const modulePaths = [
        gatsbyNodeModules,
        nodeModules,
        pnpmNodeModules,
    ];

    if (options.packages) {
        for (const pkgName of options.packages) {
            // If the defined package name option is a directory, then resolve its realpath and
            // load it directly
            if (await isDir(pkgName)) {
                modulePaths.push(await realpath(path.resolve(pkgName)));
            } else {
                // We need to check if the option is a valid dependency of the
                // current project
                const nodePath = path.resolve(path.join(nodeModules, pkgName));
                // If the resolved package name exists in the current project's
                // node_modules, then push its realpath.
                if (await fileExists(nodePath)) {
                    modulePaths.push(await realpath(nodePath));
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