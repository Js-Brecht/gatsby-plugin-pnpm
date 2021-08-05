import * as path from 'path';
import uniq from 'lodash.uniq';
import { Configuration as WebpackConfig } from 'webpack';
import { CreateWebpackConfigArgs as _CreateWebpackConfigArgs } from 'gatsby';
import { realpath, walkBack } from '../../../src/utils';
import { onCreateWebpackConfig as _onCreateWebpackConfig, IPluginOptions } from '../../../src/gatsby-node';

const reporter = {
    warn: jest.fn((message: string): string => message),
    panic: jest.fn((message: string): string => message),
};

interface CreateWebpackConfigArgs {
    actions: {
        replaceWebpackConfig: jest.Mock<WebpackConfig, [WebpackConfig]>;
    };
    reporter: typeof reporter;
    getConfig: _CreateWebpackConfigArgs['getConfig'];
    store: _CreateWebpackConfigArgs["store"];
}
type IOnCreateWebpackConfig = (actions: CreateWebpackConfigArgs, options?: IPluginOptions) => Promise<void>;

const getConfigResults = (resolutions: string[]): WebpackConfig => {
    return {
        resolve: {
            modules: uniq(resolutions),
        },
        resolveLoader: {
            modules: uniq(resolutions),
        },
    };
};

describe('Defining module/loader resolutions in silo', () => {

    const onCreateWebpackConfig = _onCreateWebpackConfig as unknown as IOnCreateWebpackConfig;
    const replaceWebpackConfig: CreateWebpackConfigArgs['actions']['replaceWebpackConfig'] = jest.fn((config) => config);
    const actions: CreateWebpackConfigArgs['actions'] = {
        replaceWebpackConfig,
    };
    const args: CreateWebpackConfigArgs = {
        actions,
        reporter,
        getConfig: () => ({}),
        store: {
            dispatch: jest.fn(),
            replaceReducer: jest.fn(),
            subscribe: jest.fn(),
            getState: () => ({
                program: {
                    directory: process.cwd(),
                },
            }),
        },
    };

    const curDir = process.cwd();
    const testsDir = path.resolve(curDir, '..');
    const testsNodeModules = path.join(testsDir, 'node_modules');
    const rootDir = path.resolve(curDir, '..', '..');
    const rootNodeModules = path.join(rootDir, 'node_modules');

    describe('Resolves with strict mode correctly', () => {
        beforeEach(() => {
            replaceWebpackConfig.mockReset();
            Object.entries(reporter).forEach(([key, fn]) => {
                fn.mockReset();
            });
        });

        it('With strict off', async () => {
            process.chdir(__dirname);
            const resolutions = [
                'node_modules',
                path.resolve(path.join(__dirname, 'node_modules')),
                await walkBack(await realpath(path.join(rootNodeModules, 'gatsby'))),
                path.resolve('node_modules', '.pnpm', 'node_modules'),
            ];
            const shouldEqual = getConfigResults(resolutions);
            await onCreateWebpackConfig(args, {
                strict: false,
            });
            expect(replaceWebpackConfig).toHaveBeenLastCalledWith(shouldEqual);
        });
        it('With strict off, include package name', async () => {
            const resolutions = [
                'node_modules',
                path.resolve(path.join(__dirname, 'node_modules')),
                await walkBack(await realpath(path.join(rootNodeModules, 'gatsby'))),
                path.resolve('node_modules', '.pnpm', 'node_modules'),
                await walkBack(await realpath(path.join(rootNodeModules, 'jest'))),
            ];
            const shouldEqual = getConfigResults(resolutions);
            await onCreateWebpackConfig(args, {
                strict: false,
                include: [
                    'jest',
                ],
            });
            expect(replaceWebpackConfig).toHaveBeenLastCalledWith(shouldEqual);
        });
        it('With strict off, include package name and directory', async () => {
            const resolutions = [
                'node_modules',
                path.resolve(path.join(__dirname, 'node_modules')),
                await walkBack(await realpath(path.join(rootNodeModules, 'gatsby'))),
                path.resolve('node_modules', '.pnpm', 'node_modules'),
                path.join(curDir, 'node_modules'),
                rootNodeModules,
            ];
            const shouldEqual = getConfigResults(resolutions);
            await onCreateWebpackConfig(args, {
                strict: false,
                include: [
                    'silo-foo-package',
                    '../../../node_modules',
                ],
            });
            expect(replaceWebpackConfig).toHaveBeenLastCalledWith(shouldEqual);
        });

        it('Panics with strict on, and no Gatsby', async () => {
            process.chdir(__dirname);
            await onCreateWebpackConfig(args, {
                strict: true,
            });
            expect(reporter.panic).toHaveBeenCalledTimes(1);
        });
    });

    describe('Resolves with projectPath correctly', () => {
        beforeEach(() => {
            replaceWebpackConfig.mockReset();
            Object.entries(reporter).forEach(([key, fn]) => {
                fn.mockReset();
            });
        });

        it('With strict off, and package includes', async () => {
            const resolutions = [
                'node_modules',
                path.join(testsNodeModules),
                await walkBack(await realpath(path.join(rootNodeModules, 'gatsby'))),
                path.resolve(path.join(testsNodeModules, '.pnpm', 'node_modules')),
                await walkBack(await realpath(path.join(rootNodeModules, 'jest'))),
                path.join(testsDir, 'node_modules'),
            ];
            const shouldEqual = getConfigResults(resolutions);
            await onCreateWebpackConfig(args, {
                strict: false,
                include: [
                    'jest',
                    'foo-package',
                ],
                projectPath: testsDir,
            });
            expect(replaceWebpackConfig).toHaveBeenLastCalledWith(shouldEqual);
        });

        it('With strict on, and package and directory includes', async () => {
            const resolutions = [
                'node_modules',
                rootNodeModules,
                await walkBack(await realpath(path.join(rootNodeModules, 'gatsby'))),
                path.join(rootNodeModules, '.pnpm', 'node_modules'),
                await walkBack(await realpath(path.join(rootNodeModules, 'jest'))),
                curDir,
                rootDir,
            ];
            const shouldEqual = getConfigResults(resolutions);
            await onCreateWebpackConfig(args, {
                strict: true,
                include: [
                    'jest',
                    curDir,
                    '.',
                ],
                projectPath: rootDir,
            });
            expect(replaceWebpackConfig).toHaveBeenLastCalledWith(shouldEqual);
        });

        it('With strict on, and panic with no Gatsby', async () => {
            await onCreateWebpackConfig(args, {
                strict: true,
                projectPath: testsDir,
            });
            expect(reporter.panic).toBeCalledTimes(1);
        });
    });
});