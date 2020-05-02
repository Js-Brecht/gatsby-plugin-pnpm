import * as path from 'path';
import { Configuration } from 'webpack';
import { GatsbyNode, CreateWebpackConfigArgs, PluginOptions } from 'gatsby';
import uniq from 'lodash.uniq';
import { isDir, getPkgNodeModules } from './utils';

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
 * | strict | **OPTIONAL**: Defaults to true.  `true` = Resolve modules using the `pnpm` philosophy of limiting the module scope of your project.  `false` = Use `node`'s module resolution, which looks in every `node_modules` walking up your directory tree. |
 */
export const onCreateWebpackConfig: GatsbyNode['onCreateWebpackConfig'] = async (
    {
        actions,
        reporter,
        getConfig,
    }: CreateWebpackConfigArgs,
    options: IPluginOptions = {} as IPluginOptions,
): Promise<void> => {
    const webpackConfig: Configuration = getConfig();
    const { replaceWebpackConfig } = actions;
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
        for (const incName of include) {
            // If the `include` name starts with a period, or a slash, then we can immediately rule out
            // it being a package
            const isDirectory = /^[./\\]/.test(incName);
            // If the current value resolves as a package, then we use it
            const nodePath = !isDirectory && await getPkgNodeModules({ pkgName: incName, nodeModules, strict });
            if (nodePath) {
                modulePaths.push(nodePath);
                continue;
            }

            // This isn't a dependency/package name, so check if it's a directory

            // Get the absolute path with the provided projectPath
            const absPath = path.isAbsolute(incName) ? incName : path.join(projectPath, incName);
            // If not a directory, then we are going to skip this one
            const pkgPath = await isDir(absPath) && absPath || '';
            // If the defined `include` option index is a directory, then load that
            if (pkgPath) {
                modulePaths.push(absPath);
                continue;
            }

            // This isn't a directory, or a package/dependency, so print a warning to tell the user
            // they might have an error in their configuration
            reporter.warn(`[gatsby-plugin-pnpm] Unable to locate dependency ${incName}!`);
        }
    }

    if (!webpackConfig.resolve) webpackConfig.resolve = {};
    if (!webpackConfig.resolveLoader) webpackConfig.resolveLoader = {};

    const compareResolvePaths = webpackConfig.resolve.modules || [];
    const compareResolveLoaderPaths = webpackConfig.resolveLoader.modules || [];

    webpackConfig.resolve.modules = uniq([...modulePaths, ...compareResolvePaths]);
    webpackConfig.resolveLoader.modules = uniq([...modulePaths, ...compareResolveLoaderPaths]);

    replaceWebpackConfig(webpackConfig);
};