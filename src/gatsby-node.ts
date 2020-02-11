import * as path from 'path';
import { Configuration } from 'webpack';
import { GatsbyNode, CreateWebpackConfigArgs, PluginOptions } from 'gatsby';
import { realpath, isDir, getPkgNodeModules } from './utils';

export interface IPluginOptions extends Omit<PluginOptions, 'plugins'> {
    include?: string[];
    projectPath?: string;
    strict?: boolean;
}

/**
 * Adds settings to the webpack configuration so that it will be able to resolve modules
 * installed using `pnpm`
 * @param {CreateWebpackConfigArgs} config The configuration options that are passed in by
 * `gatsby`.
 * @param {IPluginOptions} options The options provided by the user in `gatsby-config`.
 *
 * Available options are:
 *
 * | Option  | Description |
 * |:--------|:------------|
 * | include | **OPTIONAL**: a list of package names and/or paths that you would like to be made available to Webpack.  Each of these should either be the name of one of your project's direct dependencies, or a path to a folder containing packages that can be resolved as a module.|
 * | projectPath | **OPTIONAL**: The path to your project; i.e. the folder containing your `package.json`.  This will be used when locating package names included in `include`, and for resolving your project's `node_modules` directory |
 * | strict | **OPTIONAL**: Defaults to true.<br /> `true` = Resolve modules using the `pnpm` philosophy of limiting the module scope of your project.<br /> `false` = Use `node`'s module resolution, which looks in every `node_modules` walking up your directory tree. |
 */
export const onCreateWebpackConfig: GatsbyNode['onCreateWebpackConfig'] = async ({ actions, reporter }: CreateWebpackConfigArgs, options: IPluginOptions = {} as IPluginOptions): Promise<void> => {
    const { setWebpackConfig } = actions;
    const {
        include,
        projectPath = process.cwd(),
        strict = true,
    } = options;
    const nodeModules = path.resolve(path.join(projectPath, 'node_modules'));
    const pnpmNodeModules = path.join(nodeModules, '.pnpm', 'node_modules');

    const gatsbyNodeModules = await getPkgNodeModules({ pkgName: 'gatsby', nodeModules, strict });
    if (!gatsbyNodeModules) {
        return reporter.panic('[gatsby-plugin-pnpm] You must have Gatsby installed to use this plugin!');
    }

    const modulePaths: string[] = [
        'node_modules',
        nodeModules,
        gatsbyNodeModules,
        pnpmNodeModules,
    ];

    if (include) {
        for (const pkgName of include) {
            // If the defined package name option is a directory, then resolve its realpath and
            // load it directly
            if (await isDir(pkgName)) {
                modulePaths.push(await realpath(path.resolve(pkgName)));
            } else {
                const nodePath = await getPkgNodeModules({ pkgName, nodeModules, strict });
                if (nodePath) {
                    modulePaths.push(nodePath);
                } else {
                    reporter.warn(`[gatsby-plugin-pnpm] Unable to locate dependency ${pkgName}'s node_modules directory!`);
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