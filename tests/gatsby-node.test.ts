import * as path from 'path';
import uniq from 'lodash.uniq';
import { CreateWebpackConfigArgs as _CreateWebpackConfigArgs } from 'gatsby';
import { Configuration as WebpackConfig } from 'webpack';
import { realpath, walkBack } from '../src/utils';
import { onCreateWebpackConfig as _onCreateWebpackConfig, IPluginOptions } from '../src/gatsby-node';

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

describe('Defining module/loader resolutions', () => {

    const onCreateWebpackConfig = _onCreateWebpackConfig as unknown as IOnCreateWebpackConfig;
    const replaceWebpackConfig: CreateWebpackConfigArgs['actions']['replaceWebpackConfig'] = jest.fn((config) => config);
    const actions: CreateWebpackConfigArgs['actions'] = {
        replaceWebpackConfig,
    };
    const args: CreateWebpackConfigArgs = {
        actions,
        reporter,
        getConfig: () => ({}),
    };

    const curDir = process.cwd();

    describe('Resolves with default options accurately', () => {
        beforeEach(() => {
            replaceWebpackConfig.mockReset();
        });
        it('With default options', async () => {
            const resolutions = [
                'node_modules',
                path.resolve(path.join(process.cwd(), 'node_modules')),
                await walkBack(await realpath(path.join(process.cwd(), 'node_modules', 'gatsby'))),
                path.resolve('node_modules', '.pnpm', 'node_modules'),
            ];
            const shouldEqual = getConfigResults(resolutions);
            await onCreateWebpackConfig(args);
            expect(replaceWebpackConfig).toHaveBeenLastCalledWith(shouldEqual);
        });
    });

    describe('Resolves with include options accurately', () => {
        beforeEach(() => {
            replaceWebpackConfig.mockReset();
            Object.entries(reporter).forEach(([key, fn]) => {
                fn.mockReset();
            });
        });

        it('With package name', async () => {
            const resolutions = [
                'node_modules',
                path.resolve(path.join(process.cwd(), 'node_modules')),
                await walkBack(await realpath(path.join(process.cwd(), 'node_modules', 'gatsby'))),
                path.resolve('node_modules', '.pnpm', 'node_modules'),
                await walkBack(await realpath(path.join(process.cwd(), 'node_modules', 'jest'))),
            ];
            const shouldEqual = getConfigResults(resolutions);
            await onCreateWebpackConfig(args, {
                include: [
                    'jest',
                ],
            });
            expect(replaceWebpackConfig).toHaveBeenLastCalledWith(shouldEqual);
        });

        it('With directory', async () => {
            const resolutions = [
                'node_modules',
                path.resolve(path.join(curDir, 'node_modules')),
                await walkBack(await realpath(path.join(curDir, 'node_modules', 'gatsby'))),
                path.resolve('node_modules', '.pnpm', 'node_modules'),
                path.join(__dirname, 'node_modules'),
                path.join(process.cwd(), 'node_modules'),
            ];
            const shouldEqual = getConfigResults(resolutions);
            await onCreateWebpackConfig(args, {
                include: [
                    path.join(__dirname, 'node_modules'),
                    './node_modules',
                ],
            });
            expect(replaceWebpackConfig).toHaveBeenLastCalledWith(shouldEqual);
        });

        it('Warns with non-existant package', async () => {
            await onCreateWebpackConfig(args, {
                include: [
                    'foo-bar',
                ],
            });
            expect(reporter.warn).toHaveBeenCalledTimes(1);
        });

        it('Warns with bad directory', async () => {
            await onCreateWebpackConfig(args, {
                include: [
                    path.join(__dirname, 'foobar'),
                ],
            });
            expect(reporter.warn).toHaveBeenCalledTimes(1);
        });

    });

    describe('Resolves with strict mode correctly', () => {
        beforeEach(() => {
            replaceWebpackConfig.mockReset();
            Object.entries(reporter).forEach(([key, fn]) => {
                fn.mockReset();
            });
            process.chdir(curDir);
        });

        it('With strict on', async () => {
            const resolutions = [
                'node_modules',
                path.resolve(path.join(curDir, 'node_modules')),
                await walkBack(await realpath(path.join(curDir, 'node_modules', 'gatsby'))),
                path.resolve('node_modules', '.pnpm', 'node_modules'),
            ];
            const shouldEqual = getConfigResults(resolutions);
            await onCreateWebpackConfig(args, {
                strict: true,
            });
            expect(replaceWebpackConfig).toHaveBeenLastCalledWith(shouldEqual);
        });
        it('With strict off', async () => {
            process.chdir(__dirname);
            const resolutions = [
                'node_modules',
                path.resolve(path.join(__dirname, 'node_modules')),
                await walkBack(await realpath(path.join(curDir, 'node_modules', 'gatsby'))),
                path.resolve('node_modules', '.pnpm', 'node_modules'),
            ];
            const shouldEqual = getConfigResults(resolutions);
            await onCreateWebpackConfig(args, {
                strict: false,
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
            process.chdir(curDir);
        });

        it('With strict off, and package includes', async () => {
            process.chdir(__dirname);
            const resolutions = [
                'node_modules',
                path.resolve(path.join(__dirname, 'node_modules')),
                await walkBack(await realpath(path.join(curDir, 'node_modules', 'gatsby'))),
                path.resolve(path.join(__dirname, 'node_modules', '.pnpm', 'node_modules')),
                await walkBack(await realpath(path.join(curDir, 'node_modules', 'jest'))),
                path.join(__dirname, 'node_modules'),
            ];
            const shouldEqual = getConfigResults(resolutions);
            await onCreateWebpackConfig(args, {
                strict: false,
                include: [
                    'jest',
                    'foo-package',
                ],
                projectPath: __dirname,
            });
            expect(replaceWebpackConfig).toHaveBeenLastCalledWith(shouldEqual);
        });

        it('With strict off, and package and directory includes', async () => {
            const resolutions = [
                'node_modules',
                path.resolve(path.join(__dirname, 'node_modules')),
                await walkBack(await realpath(path.join(curDir, 'node_modules', 'gatsby'))),
                path.resolve(path.join(__dirname, 'node_modules', '.pnpm', 'node_modules')),
                await walkBack(await realpath(path.join(curDir, 'node_modules', 'jest'))),
                path.join(__dirname, 'node_modules'),
                curDir,
                __dirname,
            ];
            const shouldEqual = getConfigResults(resolutions);
            await onCreateWebpackConfig(args, {
                strict: false,
                include: [
                    'jest',
                    'foo-package',
                    curDir,
                    '.',
                ],
                projectPath: __dirname,
            });
            expect(replaceWebpackConfig).toHaveBeenLastCalledWith(shouldEqual);
        });

    });
});