"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDarkTheme = void 0;
exports.genColorMapToken = genColorMapToken;
exports.genFontMapToken = genFontMapToken;
exports.genRadius = genRadius;
exports.genControlHeight = genControlHeight;
exports.genSharedMap = genSharedMap;
exports.genSizeMapToken = genSizeMapToken;
const color_1 = require("../../../utils/color");
const luma = (hex) => {
    const { r, g, b } = (0, color_1.parse)(hex);
    const a = [r, g, b].map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
};
/** A theme is "dark" when its background is darker than its text base. */
const isDarkTheme = (seed) => luma(seed.colorBgBase) < luma(seed.colorTextBase);
exports.isDarkTheme = isDarkTheme;
/** Map a 10-step palette onto the functional token names.
 *  `palette` is light->dark: index 0 = lightest, 5 = base, 9 = darkest.
 *  Light mode: subtle bg uses light tints, text uses the base (readable on white).
 *  Dark mode: subtle bg uses dark shades, text uses light tints (readable on near-black). */
function genColorLevels(name, palette, dark) {
    const i = dark
        ? { bg: 9, bgHover: 8, border: 7, borderHover: 6, hover: 4, active: 7, text: 4, textHover: 3, textActive: 5 }
        : { bg: 0, bgHover: 1, border: 2, borderHover: 3, hover: 4, active: 6, text: 5, textHover: 4, textActive: 6 };
    return {
        [`color${name}Bg`]: palette[i.bg],
        [`color${name}BgHover`]: palette[i.bgHover],
        [`color${name}Border`]: palette[i.border],
        [`color${name}BorderHover`]: palette[i.borderHover],
        [`color${name}Hover`]: palette[i.hover],
        [`color${name}Active`]: palette[i.active],
        [`color${name}Text`]: palette[i.text],
        [`color${name}TextHover`]: palette[i.textHover],
        [`color${name}TextActive`]: palette[i.textActive],
    };
}
function genColorMapToken(seed) {
    const dark = (0, exports.isDarkTheme)(seed);
    const tb = seed.colorTextBase;
    const bb = seed.colorBgBase;
    const t = (alpha) => (0, color_1.fade)(tb, dark ? alpha.d : alpha.l);
    const groups = {
        primary: seed.colorPrimary,
        success: seed.colorSuccess,
        error: seed.colorError,
        warning: seed.colorWarning,
        info: seed.colorInfo,
        link: seed.colorLink || seed.colorPrimary,
    };
    const colorMap = {};
    Object.keys(groups).forEach((key) => {
        const base = groups[key];
        const pal = (0, color_1.generate)(base);
        const Name = key.charAt(0).toUpperCase() + key.slice(1);
        Object.assign(colorMap, genColorLevels(Name, pal, dark));
    });
    const linkPal = (0, color_1.generate)(groups.link);
    const linkIdx = dark ? 5 : 6;
    const linkHoverIdx = dark ? 6 : 5;
    return {
        // text (4 fade levels)
        colorText: t({ l: 0.88, d: 0.85 }),
        colorTextSecondary: t({ l: 0.65, d: 0.65 }),
        colorTextTertiary: t({ l: 0.45, d: 0.45 }),
        colorTextQuaternary: t({ l: 0.25, d: 0.25 }),
        // backgrounds
        colorBgContainer: bb,
        colorBgElevated: dark ? '#1f1f1f' : bb,
        colorBgLayout: (0, color_1.transparentColor)(tb, dark ? 0.15 : 0.04, bb),
        colorBgSpotlight: dark ? '#ffffff' : '#1f1f1f',
        colorBgMask: (0, color_1.fade)('#000000', dark ? 0.65 : 0.45),
        // antd 中不随主题反转：永远用于实色底上
        colorTextLightSolid: '#ffffff',
        // borders & splits
        colorBorder: t({ l: 0.15, d: 0.2 }),
        colorBorderSecondary: t({ l: 0.06, d: 0.1 }),
        colorSplit: t({ l: 0.06, d: 0.1 }),
        // fills：对齐 antd 官方值 —— 亮色以深色文本为底淡入，暗色以白为底淡入
        // （旧实现把暗色 alpha 直接拿深色文本叠深底，0.45 几乎不透明 → 卡片/墨条发白）
        colorFill: dark ? 'rgba(255, 255, 255, 0.18)' : (0, color_1.fade)(tb, 0.15),
        colorFillSecondary: dark ? 'rgba(255, 255, 255, 0.1)' : (0, color_1.fade)(tb, 0.06),
        colorFillTertiary: dark ? 'rgba(255, 255, 255, 0.04)' : (0, color_1.fade)(tb, 0.04),
        colorFillQuaternary: dark ? 'rgba(255, 255, 255, 0.02)' : (0, color_1.fade)(tb, 0.02),
        colorFillContent: dark ? 'rgba(255, 255, 255, 0.1)' : (0, color_1.fade)(tb, 0.06),
        // link
        colorLinkHover: linkPal[linkHoverIdx],
        colorLinkActive: linkPal[linkIdx],
        ...colorMap,
    };
}
/** Font-size & line-height scale. */
function genFontMapToken(seed) {
    const fontSize = seed.fontSize;
    const lineHeight = seed.lineHeight;
    const genLineHeight = (size) => Math.round(((size + 8) / size) * 10) / 10;
    return {
        fontSizeSM: Math.max(10, fontSize - 2),
        fontSizeLG: fontSize + 2,
        fontSizeXL: Math.round(fontSize * 1.6),
        fontSizeIcon: Math.max(10, fontSize - 2),
        lineHeight: Number(lineHeight.toFixed(3)),
        lineHeightLG: genLineHeight(fontSize + 2),
        lineHeightSM: genLineHeight(Math.max(10, fontSize - 2)),
    };
}
/** Border-radius scale. */
function genRadius(seed) {
    const r = seed.borderRadius;
    return {
        borderRadius: r,
        borderRadiusXS: r > 4 ? 2 : Math.floor(r / 4),
        borderRadiusSM: r > 6 ? r / 2 : r > 4 ? r - 2 : Math.floor((r / 4) * 3),
        borderRadiusLG: r > 6 ? r + 2 : r * 2,
        borderRadiusOuter: r * 0.5,
    };
}
/** Control height scale. */
function genControlHeight(seed) {
    const h = seed.controlHeight;
    return {
        controlHeight: h,
        controlHeightLG: h + 8,
        controlHeightSM: h * 0.75,
        controlHeightXS: h * 0.5,
    };
}
/** Border widths & motion durations. */
function genSharedMap(seed) {
    return {
        lineWidth: seed.lineWidth,
        lineWidthFocus: seed.lineWidth * 3,
        motionDurationFast: `${(seed.motionUnit * 1).toFixed(1)}s`,
        motionDurationMid: `${(seed.motionUnit * 2).toFixed(1)}s`,
        motionDurationSlow: `${(seed.motionUnit * 3).toFixed(1)}s`,
    };
}
/** Spacing / padding / margin scale derived from sizeStep & fontSize. */
function genSizeMapToken(seed) {
    const unit = seed.sizeUnit;
    const step = seed.sizeStep;
    const size = step * unit; // 16
    return {
        sizeXXS: unit * 1, // 4
        sizeXS: unit * 2, // 8
        sizeSM: unit * 3, // 12
        size, // 16
        sizeMD: size, // 16
        sizeLG: unit * 8, // 32
        sizeXL: unit * 14, // 56
        sizeXXL: unit * 20, // 80
        paddingXXS: unit, // 4
        paddingXS: unit * 2, // 8
        paddingSM: unit * 3, // 12
        padding: size, // 16
        paddingMD: unit * 5, // 20
        paddingLG: unit * 8, // 32
        paddingXL: unit * 12, // 48
        paddingContentHorizontal: unit * 4, // 16
        paddingContentVertical: unit * 3, // 12
        paddingContentHorizontalLG: unit * 5, // 20
        paddingContentVerticalLG: unit * 4, // 16
        paddingContentHorizontalSM: unit * 3, // 12
        paddingContentVerticalSM: unit * 2, // 8
        marginXXS: unit, // 4
        marginXS: unit * 2, // 8
        marginSM: unit * 3, // 12
        margin: size, // 16
        marginMD: unit * 5, // 20
        marginLG: unit * 8, // 32
        marginXL: unit * 14, // 56
        marginXXL: unit * 20, // 80
    };
}
