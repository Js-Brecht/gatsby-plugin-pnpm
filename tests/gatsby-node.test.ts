import * as path from 'path';
import { realpath, walkBack } from '../src/utils';
import { Configuration as WebpackConfig } from 'webpack';
import { onCreateWebpackConfig as _onCreateWebpackConfig, IPluginOptions } from '../src/gatsby-node';

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

describe('Defining module/loader resolutions', () => {

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

    describe('Resolves with default options accurately', () => {
        beforeEach(() => {
            setWebpackConfig.mockReset();
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
            expect(setWebpackConfig).toHaveBeenLastCalledWith(shouldEqual);
        });
    });

    describe('Resolves with include options accurately', () => {
        beforeEach(() => {
            setWebpackConfig.mockReset();
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
            expect(setWebpackConfig).toHaveBeenLastCalledWith(shouldEqual);
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
            expect(setWebpackConfig).toHaveBeenLastCalledWith(shouldEqual);
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
            setWebpackConfig.mockReset();
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
            expect(setWebpackConfig).toHaveBeenLastCalledWith(shouldEqual);
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
            expect(setWebpackConfig).toHaveBeenLastCalledWith(shouldEqual);
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
            expect(setWebpackConfig).toHaveBeenLastCalledWith(shouldEqual);
        });

    });
});