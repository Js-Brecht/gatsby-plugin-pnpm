import { realpathSync } from 'fs';
import { dirname, join } from 'path';
import { GatsbyNode, CreateWebpackConfigArgs } from 'gatsby';

/**
 * Adds settings to the webpack configuration so that it will be able to resolve modules
 * installed using `pnpm`
 * @param {CreateWebpackConfigArgs} config The configuration options that are passed in by
 * `gatsby`.
 */
export const onCreateWebpackConfig: GatsbyNode['onCreateWebpackConfig'] = ({ actions }: CreateWebpackConfigArgs): void => {
    const nodeModules = join(process.cwd(), 'node_modules');
    const gatsbyNodeModules = dirname(realpathSync(join(nodeModules, 'gatsby')));
    actions.setWebpackConfig({
        resolve: {
            modules: [
                gatsbyNodeModules,
                nodeModules,
                'node_modules'
            ]
        }
    });
};