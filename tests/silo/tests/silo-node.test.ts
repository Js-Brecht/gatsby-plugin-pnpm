import * as path from 'path';
import { realpath, walkBack } from '../../../src/utils';
import { Configuration as WebpackConfig } from 'webpack';
import { onCreateWebpackConfig as _onCreateWebpackConfig, IPluginOptions } from '../../../src/gatsby-node';

const reporter = {
    warn: jest.fn((message: string): string => message),
    panic: jest.fn((message: string): string => message),
};

interface CreateWebpackConfigArgs {
    actions: {
        setWebpackConfig: jest.Mock<WebpackConfig, [WebpackConfig]>;
    };
    reporter: typeof reporter;
}
type IOnCreateWebpackConfig = (actions: CreateWebpackConfigArgs, options?: IPluginOptions) => Promise<void>;

const getConfigResults = (resolutions: string[]): WebpackConfig => {
    return {
        resolve: {
            modules: resolutions,
        },
        resolveLoader: {
            modules: resolutions,
        },
    };
};

describe('Defining module/loader resolutions in silo', () => {

    const onCreateWebpackConfig = _onCreateWebpackConfig as unknown as IOnCreateWebpackConfig;
    const setWebpackConfig: CreateWebpackConfigArgs['actions']['setWebpackConfig'] = jest.fn((config) => config);
    const actions: CreateWebpackConfigArgs['actions'] = {
        setWebpackConfig,
    };
    const args: CreateWebpackConfigArgs = {
        actions,
        reporter,
    };

    const curDir = process.cwd();
    const testsDir = path.resolve(curDir, '..');
    const testsNodeModules = path.join(testsDir, 'node_modules');
    const rootDir = path.resolve(curDir, '..', '..');
    const rootNodeModules = path.join(rootDir, 'node_modules');

    describe('Resolves with strict mode correctly', () => {
        beforeEach(() => {
            setWebpackConfig.mockReset();
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
            expect(setWebpackConfig).toHaveBeenLastCalledWith(shouldEqual);
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
            expect(setWebpackConfig).toHaveBeenLastCalledWith(shouldEqual);
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
                    'foo-package',
                    '../../../node_modules',
                ],
            });
            expect(setWebpackConfig).toHaveBeenLastCalledWith(shouldEqual);
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
            setWebpackConfig.mockReset();
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
            expect(setWebpackConfig).toHaveBeenLastCalledWith(shouldEqual);
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
            expect(setWebpackConfig).toHaveBeenLastCalledWith(shouldEqual);
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