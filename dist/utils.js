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
var fs_1 = require("fs");
var util_1 = require("util");
var stat = util_1.promisify(fs_1.stat);
exports.realpath = util_1.promisify(fs_1.realpath);
exports.fileExists = function (filepath) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2, new Promise(function (resolve) {
                fs_1.stat(filepath, function (err, fileStats) {
                    if (err) {
                        return resolve();
                    }
                    resolve(fileStats);
                });
            })];
    });
}); };
exports.isDir = function (pathname) { return __awaiter(void 0, void 0, void 0, function () {
    var fsStat, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4, stat(pathname)];
            case 1:
                fsStat = _a.sent();
                return [2, fsStat.isDirectory()];
            case 2:
                err_1 = _a.sent();
                return [3, 3];
            case 3: return [2, false];
        }
    });
}); };
exports.walkBack = function (startPath) { return __awaiter(void 0, void 0, void 0, function () {
    var procPath, lastProcPath, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                procPath = path.resolve(startPath);
                lastProcPath = '';
                _b.label = 1;
            case 1:
                if (!(procPath.length > 0)) return [3, 4];
                _a = path.basename(procPath) === 'node_modules';
                if (!_a) return [3, 3];
                return [4, exports.isDir(procPath)];
            case 2:
                _a = (_b.sent());
                _b.label = 3;
            case 3:
                if (_a)
                    return [2, procPath];
                procPath = path.resolve(procPath, '..');
                if (procPath === lastProcPath)
                    return [3, 4];
                lastProcPath = procPath;
                return [3, 1];
            case 4: return [2, ''];
        }
    });
}); };
exports.getPkgNodeModules = function (_a) {
    var pkgName = _a.pkgName, nodeModules = _a.nodeModules, strict = _a.strict;
    return __awaiter(void 0, void 0, void 0, function () {
        var pkgPath, nodePath, _b, _c, _d, _e, err_2, err_3;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _f.trys.push([0, 9, , 10]);
                    pkgPath = strict ?
                        path.join(nodeModules, pkgName) :
                        require.resolve(pkgName, {
                            paths: [
                                nodeModules,
                            ],
                        });
                    return [4, exports.fileExists(pkgPath)];
                case 1:
                    if (!_f.sent()) return [3, 8];
                    _f.label = 2;
                case 2:
                    _f.trys.push([2, 7, , 8]);
                    _c = (_b = path).join;
                    _d = exports.walkBack;
                    if (!strict) return [3, 4];
                    return [4, exports.realpath(pkgPath)];
                case 3:
                    _e = _f.sent();
                    return [3, 5];
                case 4:
                    _e = pkgPath;
                    _f.label = 5;
                case 5: return [4, _d.apply(void 0, [_e])];
                case 6:
                    nodePath = _c.apply(_b, [_f.sent()]);
                    return [2, nodePath];
                case 7:
                    err_2 = _f.sent();
                    return [3, 8];
                case 8: return [3, 10];
                case 9:
                    err_3 = _f.sent();
                    return [3, 10];
                case 10: return [2, ''];
            }
        });
    });
};