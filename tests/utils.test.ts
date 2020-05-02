import * as path from 'path';
import { mocked } from 'ts-jest/utils';
import { isDir, fileExists, walkBack, realpath, getPkgNodeModules } from '../src/utils';

jest.mock('path');
const { resolve, join } = jest.requireActual('path');

describe('Utility function tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mocked(path.resolve).mockImplementation((str) => resolve(str));
        mocked(path.join).mockImplementation((...str) => join(...str));
    });

    const curDir = process.cwd();
    const curFile = join(curDir, 'package.json');
    const projectNodeModules = join(curDir, 'node_modules');

    it('isDir() is accurate', async () => {
        expect(await isDir(curDir)).toBe(true);
        expect(await isDir(curFile)).toBe(false);
    });
    it('fileExists() is accurate', async () => {
        expect(await fileExists(curFile)).not.toBe(void 0);
        expect(await fileExists(join(curDir, 'asdf'))).toBe(void 0);
    });
    describe('walkBack() is accurate', () => {
        beforeEach(() => {
            mocked(path.resolve).mockImplementation((str) => str);
        });

        it('With node_modules as start, and with nested paths', async () => {
            const shouldBe = join(curDir, 'node_modules');
            expect(await walkBack(shouldBe)).toBe(shouldBe);
            expect(await walkBack(join(shouldBe, 'gatsby', 'dist'))).toBe(shouldBe);
        });
        it('With backslashes in path', async () => {
            const shouldBe = join(curDir, 'node_modules').replace(/\//g, '\\');
            expect(await walkBack(join(shouldBe, 'test', 'dist').replace(/\//g, '\\'))).toBe(shouldBe);
        });
        it('Returns 0-length string at beginning of tree', async () => {
            const shouldBe = '';
            expect(await walkBack(resolve('/'))).toBe(shouldBe);
        });
        it('Returns 0-length string when no "node_modules" exists in path', async () => {
            const shouldBe = '';
            expect(await walkBack('/asdf/123/4321/fdsa/foo/bar/baz/boom')).toBe(shouldBe);
        });
    });
    describe('getPkgNodeModules() is accurate', () => {
        beforeEach(() => {
            process.chdir(curDir);
        });

        it('Resolves Gatsby with strict mode correctly', async () => {
            const shouldBe = await walkBack(await realpath(join(curDir, 'node_modules', 'gatsby')));
            expect(await getPkgNodeModules({
                pkgName: 'gatsby',
                nodeModules: projectNodeModules,
                strict: true,
            })).toBe(shouldBe);
        });
        it('Fails to resolve Gatsby with strict on and without direct dependency', async () => {
            const shouldBe = '';
            process.chdir(__dirname);
            expect(await getPkgNodeModules({
                pkgName: 'gatsby',
                nodeModules: join(__dirname, 'node_modules'),
                strict: true,
            })).toBe(shouldBe);
        });
    });
});