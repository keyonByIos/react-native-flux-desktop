"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultSeed = void 0;
exports.buildAliasToken = buildAliasToken;
const seed_1 = require("./seed");
const shared_1 = require("./shared");
const color_1 = require("../../utils/color");
/** Seed-level overrides each built-in algorithm applies before derivation. */
const algorithmSeedPresets = {
    default: {},
    dark: {
        colorTextBase: '#ffffff',
        colorBgBase: '#141414',
    },
    compact: {
        fontSize: 12,
        borderRadius: 6,
        controlHeight: 26,
        sizeStep: 2,
    },
};
/** Spacing / control aliases that live only in the Alias layer. */
function genAliasToken(seed, map) {
    const dark = (0, shared_1.isDarkTheme)(seed);
    const colorPrimary = map.colorPrimary;
    return {
        colorBgContainerDisabled: map.colorFillQuaternary,
        // Text/icons sitting on a solid primary (or otherwise colored) background
        // stay white in both light and dark for consistent contrast (e.g. a black
        // glyph on a dark-blue primary button would be unreadable).
        colorTextOnPrimaryBackground: '#ffffff',
        controlOutline: (0, color_1.fade)(colorPrimary, dark ? 0.3 : 0.15),
        controlOutlineWidth: map.lineWidthFocus,
        controlItemBgHover: map.colorFillTertiary,
        controlItemBgActive: map.colorPrimaryBg,
    };
}
/** Compose a complete AliasToken from user seed overrides + one or more algorithms. */
function buildAliasToken(userToken = {}, algorithm = 'default') {
    // Allow overlapping algorithms (e.g. ['dark', 'compact']): merge their seed
    // presets left-to-right so dark + dense compose into a single token set.
    const algorithms = Array.isArray(algorithm) ? algorithm : [algorithm];
    const preset = algorithms.reduce((acc, a) => ({ ...acc, ...(algorithmSeedPresets[a] ?? {}) }), {});
    const seed = { ...seed_1.defaultSeed, ...preset, ...userToken };
    const map = {
        ...seed,
        ...(0, shared_1.genColorMapToken)(seed),
        ...(0, shared_1.genFontMapToken)(seed),
        ...(0, shared_1.genRadius)(seed),
        ...(0, shared_1.genControlHeight)(seed),
        ...(0, shared_1.genSharedMap)(seed),
        ...(0, shared_1.genSizeMapToken)(seed),
    };
    const alias = {
        ...map,
        ...(0, shared_1.genSizeMapToken)(seed),
        ...genAliasToken(seed, map),
        // carry any direct alias overrides the user passed in
        ...userToken,
    };
    return alias;
}
var seed_2 = require("./seed");
Object.defineProperty(exports, "defaultSeed", { enumerable: true, get: function () { return seed_2.defaultSeed; } });
__exportStar(require("./shared"), exports);
