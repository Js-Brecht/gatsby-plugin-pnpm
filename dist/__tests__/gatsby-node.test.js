"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var path = __importStar(require("path"));
var utils_1 = require("../utils");
var gatsby_node_1 = require("../gatsby-node");
var reporter = {
    warn: jest.fn(function (message) { return message; }),
    panic: jest.fn(function (message) { return message; }),
};
var getConfigResults = function (resolutions) {
    return {
        resolve: {
            modules: resolutions,
        },
        resolveLoader: {
            modules: resolutions,
        },
    };
};
describe('Defining module/loader resolutions', function () {
    var onCreateWebpackConfig = gatsby_node_1.onCreateWebpackConfig;
    var setWebpackConfig = jest.fn(function (config) { return config; });
    var actions = {
        setWebpackConfig: setWebpackConfig,
    };
    var args = {
        actions: actions,
        reporter: reporter,
    };
    var curDir = process.cwd();
    describe('Resolves with default options accurately', function () {
        beforeEach(function () {
            setWebpackConfig.mockReset();
        });
        it('With default options', function () { return __awaiter(void 0, void 0, void 0, function () {
            var resolutions, _a, _b, shouldEqual;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = ['node_modules',
                            path.resolve(path.join(process.cwd(), 'node_modules'))];
                        _b = utils_1.walkBack;
                        return [4, utils_1.realpath(path.join(process.cwd(), 'node_modules', 'gatsby'))];
                    case 1: return [4, _b.apply(void 0, [_c.sent()])];
                    case 2:
                        resolutions = _a.concat([
                            _c.sent(),
                            path.resolve('node_modules', '.pnpm', 'node_modules')
                        ]);
                        shouldEqual = getConfigResults(resolutions);
                        return [4, onCreateWebpackConfig(args)];
                    case 3:
                        _c.sent();
                        expect(setWebpackConfig).toHaveBeenLastCalledWith(shouldEqual);
                        return [2];
                }
            });
        }); });
    });
    describe('Resolves with include options accurately', function () {
        beforeEach(function () {
            setWebpackConfig.mockReset();
            Object.entries(reporter).forEach(function (_a) {
                var key = _a[0], fn = _a[1];
                fn.mockReset();
            });
        });
        it('With package name', function () { return __awaiter(void 0, void 0, void 0, function () {
            var resolutions, _a, _b, _c, shouldEqual;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = ['node_modules',
                            path.resolve(path.join(process.cwd(), 'node_modules'))];
                        _b = utils_1.walkBack;
                        return [4, utils_1.realpath(path.join(process.cwd(), 'node_modules', 'gatsby'))];
                    case 1: return [4, _b.apply(void 0, [_d.sent()])];
                    case 2:
                        _a = _a.concat([
                            _d.sent(),
                            path.resolve('node_modules', '.pnpm', 'node_modules')
                        ]);
                        _c = utils_1.walkBack;
                        return [4, utils_1.realpath(path.join(process.cwd(), 'node_modules', 'jest'))];
                    case 3: return [4, _c.apply(void 0, [_d.sent()])];
                    case 4:
                        resolutions = _a.concat([
                            _d.sent()
                        ]);
                        shouldEqual = getConfigResults(resolutions);
                        return [4, onCreateWebpackConfig(args, {
                                include: [
                                    'jest',
                                ],
                            })];
                    case 5:
                        _d.sent();
                        expect(setWebpackConfig).toHaveBeenLastCalledWith(shouldEqual);
                        return [2];
                }
            });
        }); });
        it('With directory', function () { return __awaiter(void 0, void 0, void 0, function () {
            var resolutions, _a, _b, shouldEqual;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = ['node_modules',
                            path.resolve(path.join(curDir, 'node_modules'))];
                        _b = utils_1.walkBack;
                        return [4, utils_1.realpath(path.join(curDir, 'node_modules', 'gatsby'))];
                    case 1: return [4, _b.apply(void 0, [_c.sent()])];
                    case 2:
                        resolutions = _a.concat([
                            _c.sent(),
                            path.resolve('node_modules', '.pnpm', 'node_modules'),
                            path.join(__dirname, 'node_modules'),
                            path.join(process.cwd(), 'node_modules')
                        ]);
                        shouldEqual = getConfigResults(resolutions);
                        return [4, onCreateWebpackConfig(args, {
                                include: [
                                    path.join(__dirname, 'node_modules'),
                                    './node_modules',
                                ],
                            })];
                    case 3:
                        _c.sent();
                        expect(setWebpackConfig).toHaveBeenLastCalledWith(shouldEqual);
                        return [2];
                }
            });
        }); });
        it('Warns with non-existant package', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, onCreateWebpackConfig(args, {
                            include: [
                                'foo-bar',
                            ],
                        })];
                    case 1:
                        _a.sent();
                        expect(reporter.warn).toHaveBeenCalledTimes(1);
                        return [2];
                }
            });
        }); });
        it('Warns with bad directory', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, onCreateWebpackConfig(args, {
                            include: [
                                path.join(__dirname, 'foobar'),
                            ],
                        })];
                    case 1:
                        _a.sent();
                        expect(reporter.warn).toHaveBeenCalledTimes(1);
                        return [2];
                }
            });
        }); });
    });
    describe('Resolves with strict mode correctly', function () {
        beforeEach(function () {
            setWebpackConfig.mockReset();
            Object.entries(reporter).forEach(function (_a) {
                var key = _a[0], fn = _a[1];
                fn.mockReset();
            });
            process.chdir(curDir);
        });
        it('With strict on', function () { return __awaiter(void 0, void 0, void 0, function () {
            var resolutions, _a, _b, shouldEqual;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = ['node_modules',
                            path.resolve(path.join(curDir, 'node_modules'))];
                        _b = utils_1.walkBack;
                        return [4, utils_1.realpath(path.join(curDir, 'node_modules', 'gatsby'))];
                    case 1: return [4, _b.apply(void 0, [_c.sent()])];
                    case 2:
                        resolutions = _a.concat([
                            _c.sent(),
                            path.resolve('node_modules', '.pnpm', 'node_modules')
                        ]);
                        shouldEqual = getConfigResults(resolutions);
                        return [4, onCreateWebpackConfig(args, {
                                strict: true,
                            })];
                    case 3:
                        _c.sent();
                        expect(setWebpackConfig).toHaveBeenLastCalledWith(shouldEqual);
                        return [2];
                }
            });
        }); });
        it('With strict off', function () { return __awaiter(void 0, void 0, void 0, function () {
            var resolutions, _a, _b, shouldEqual;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        process.chdir(__dirname);
                        _a = ['node_modules',
                            path.resolve(path.join(__dirname, 'node_modules'))];
                        _b = utils_1.walkBack;
                        return [4, utils_1.realpath(path.join(curDir, 'node_modules', 'gatsby'))];
                    case 1: return [4, _b.apply(void 0, [_c.sent()])];
                    case 2:
                        resolutions = _a.concat([
                            _c.sent(),
                            path.resolve('node_modules', '.pnpm', 'node_modules')
                        ]);
                        shouldEqual = getConfigResults(resolutions);
                        return [4, onCreateWebpackConfig(args, {
                                strict: false,
                            })];
                    case 3:
                        _c.sent();
                        expect(setWebpackConfig).toHaveBeenLastCalledWith(shouldEqual);
                        return [2];
                }
            });
        }); });
        it('Panics with strict on, and no Gatsby', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        process.chdir(__dirname);
                        return [4, onCreateWebpackConfig(args, {
                                strict: true,
                            })];
                    case 1:
                        _a.sent();
                        expect(reporter.panic).toHaveBeenCalledTimes(1);
                        return [2];
                }
            });
        }); });
    });
    describe('Resolves with projectPath correctly', function () {
        beforeEach(function () {
            setWebpackConfig.mockReset();
            Object.entries(reporter).forEach(function (_a) {
                var key = _a[0], fn = _a[1];
                fn.mockReset();
            });
            process.chdir(curDir);
        });
        it('With strict off, and package includes', function () { return __awaiter(void 0, void 0, void 0, function () {
            var resolutions, _a, _b, _c, shouldEqual;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        process.chdir(__dirname);
                        _a = ['node_modules',
                            path.resolve(path.join(__dirname, 'node_modules'))];
                        _b = utils_1.walkBack;
                        return [4, utils_1.realpath(path.join(curDir, 'node_modules', 'gatsby'))];
                    case 1: return [4, _b.apply(void 0, [_d.sent()])];
                    case 2:
                        _a = _a.concat([
                            _d.sent(),
                            path.resolve(path.join(__dirname, 'node_modules', '.pnpm', 'node_modules'))
                        ]);
                        _c = utils_1.walkBack;
                        return [4, utils_1.realpath(path.join(curDir, 'node_modules', 'jest'))];
                    case 3: return [4, _c.apply(void 0, [_d.sent()])];
                    case 4:
                        resolutions = _a.concat([
                            _d.sent(),
                            path.join(__dirname, 'node_modules')
                        ]);
                        shouldEqual = getConfigResults(resolutions);
                        return [4, onCreateWebpackConfig(args, {
                                strict: false,
                                include: [
                                    'jest',
                                    'foo-package',
                                ],
                                projectPath: __dirname,
                            })];
                    case 5:
                        _d.sent();
                        expect(setWebpackConfig).toHaveBeenLastCalledWith(shouldEqual);
                        return [2];
                }
            });
        }); });
        it('With strict off, and package and directory includes', function () { return __awaiter(void 0, void 0, void 0, function () {
            var resolutions, _a, _b, _c, shouldEqual;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = ['node_modules',
                            path.resolve(path.join(__dirname, 'node_modules'))];
                        _b = utils_1.walkBack;
                        return [4, utils_1.realpath(path.join(curDir, 'node_modules', 'gatsby'))];
                    case 1: return [4, _b.apply(void 0, [_d.sent()])];
                    case 2:
                        _a = _a.concat([
                            _d.sent(),
                            path.resolve(path.join(__dirname, 'node_modules', '.pnpm', 'node_modules'))
                        ]);
                        _c = utils_1.walkBack;
                        return [4, utils_1.realpath(path.join(curDir, 'node_modules', 'jest'))];
                    case 3: return [4, _c.apply(void 0, [_d.sent()])];
                    case 4:
                        resolutions = _a.concat([
                            _d.sent(),
                            path.join(__dirname, 'node_modules'),
                            curDir,
                            curDir
                        ]);
                        shouldEqual = getConfigResults(resolutions);
                        return [4, onCreateWebpackConfig(args, {
                                strict: false,
                                include: [
                                    'jest',
                                    'foo-package',
                                    curDir,
                                    '.',
                                ],
                                projectPath: __dirname,
                            })];
                    case 5:
                        _d.sent();
                        expect(setWebpackConfig).toHaveBeenLastCalledWith(shouldEqual);
                        return [2];
                }
            });
        }); });
    });
});
