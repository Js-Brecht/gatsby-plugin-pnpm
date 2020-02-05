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
var utils_1 = require("./utils");
exports.onCreateWebpackConfig = function (_a, options) {
    var actions = _a.actions, reporter = _a.reporter;
    return __awaiter(void 0, void 0, void 0, function () {
        var setWebpackConfig, nodeModules, pnpmNodeModules, gatsbyNodeModules, _b, modulePaths, _i, _c, pkgName, _d, _e, pkgPath, nodePath, _f, config;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    setWebpackConfig = actions.setWebpackConfig;
                    nodeModules = path.join(process.cwd(), 'node_modules');
                    pnpmNodeModules = path.join(nodeModules, '.pnpm', 'node_modules');
                    _b = utils_1.walkBack;
                    return [4, utils_1.realpath(path.join(nodeModules, 'gatsby'))];
                case 1: return [4, _b.apply(void 0, [_g.sent()])];
                case 2:
                    gatsbyNodeModules = _g.sent();
                    if (!gatsbyNodeModules) {
                        return [2, reporter.panic("[gatsby-plugin-pnpm] Unable to resolve your Gatsby install's real path!!")];
                    }
                    modulePaths = [
                        'node_modules',
                        nodeModules,
                        gatsbyNodeModules,
                        pnpmNodeModules,
                    ];
                    if (!options.resolutions) return [3, 11];
                    _i = 0, _c = options.include;
                    _g.label = 3;
                case 3:
                    if (!(_i < _c.length)) return [3, 11];
                    pkgName = _c[_i];
                    return [4, utils_1.isDir(pkgName)];
                case 4:
                    if (!_g.sent()) return [3, 6];
                    _e = (_d = modulePaths).push;
                    return [4, utils_1.realpath(path.resolve(pkgName))];
                case 5:
                    _e.apply(_d, [_g.sent()]);
                    return [3, 10];
                case 6:
                    pkgPath = path.resolve(path.join(nodeModules, pkgName));
                    return [4, utils_1.fileExists(pkgPath)];
                case 7:
                    if (!_g.sent()) return [3, 10];
                    _f = utils_1.walkBack;
                    return [4, utils_1.realpath(pkgPath)];
                case 8: return [4, _f.apply(void 0, [_g.sent()])];
                case 9:
                    nodePath = _g.sent();
                    if (nodePath)
                        modulePaths.push(nodePath);
                    if (!nodePath) {
                        reporter.warn("[gatsby-plugin-pnpm] Unable to locate dependency " + pkgName + "'s node_modules from its real path");
                    }
                    _g.label = 10;
                case 10:
                    _i++;
                    return [3, 3];
                case 11:
                    config = {
                        resolve: {
                            modules: modulePaths,
                        },
                        resolveLoader: {
                            modules: modulePaths,
                        },
                    };
                    setWebpackConfig(config);
                    return [2];
            }
        });
    });
};
