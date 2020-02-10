import * as path from 'path';
import { isDir, fileExists, walkBack, realpath, getPkgNodeModules } from '../utils';

describe('Utility function tests', () => {
    const curDir = process.cwd();
    const curFile = path.join(curDir, 'package.json');
    const projectNodeModules = path.join(curDir, 'node_modules');

    it('isDir() is accurate', async () => {
        expect(await isDir(curDir)).toBe(true);
        expect(await isDir(curFile)).toBe(false);
    });
    it('fileExists() is accurate', async () => {
        expect(await fileExists(curFile)).not.toBe(void 0);
        expect(await fileExists(path.join(curDir, 'asdf'))).toBe(void 0);
    });
    describe('walkBack() is accurate', () => {
        it('With node_modules as start, and with nested paths', async () => {
            const shouldBe = path.join(curDir, 'node_modules');
            expect(await walkBack(shouldBe)).toBe(shouldBe);
            expect(await walkBack(path.join(shouldBe, 'gatsby', 'dist'))).toBe(shouldBe);
        });
        it('Returns 0-length string at beginning of tree', async () => {
            const shouldBe = '';
            expect(await walkBack(path.resolve('/'))).toBe(shouldBe);
        });
    });
    describe('getPkgNodeModules() is accurate', () => {
        beforeEach(() => {
            process.chdir(curDir);
        });
        it('Resolves Gatsby with strict mode correctly', async () => {
            const shouldBe = await walkBack(await realpath(path.join(curDir, 'node_modules', 'gatsby')));
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
                nodeModules: path.join(__dirname, 'node_modules'),
                strict: true,
            })).toBe(shouldBe);
        });
    });
});