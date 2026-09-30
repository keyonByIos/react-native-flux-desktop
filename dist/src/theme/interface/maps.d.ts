import type { SeedToken } from './seed';
/** A 10-step color ramp: [1..10] from lightest tint to darkest shade. */
export type ColorPalettes = string[];
/**
 * Map Token — the first derivation layer. Contains color palettes,
 * font/size/border scales computed from the Seed Token.
 */
export interface MapToken extends SeedToken {
    colorText: string;
    colorTextSecondary: string;
    colorTextTertiary: string;
    colorTextQuaternary: string;
    colorBgContainer: string;
    colorBgElevated: string;
    colorBgLayout: string;
    colorBgSpotlight: string;
    colorBgMask: string;
    /** 实色背景（primary/error 等）上的文字色，对齐 antd 同名 token */
    colorTextLightSolid: string;
    colorBorder: string;
    colorBorderSecondary: string;
    colorSplit: string;
    colorFill: string;
    colorFillSecondary: string;
    colorFillTertiary: string;
    colorFillQuaternary: string;
    colorFillContent: string;
    colorPrimaryHover: string;
    colorPrimaryActive: string;
    colorPrimaryBg: string;
    colorPrimaryBgHover: string;
    colorPrimaryBorder: string;
    colorPrimaryBorderHover: string;
    colorPrimaryText: string;
    colorPrimaryTextHover: string;
    colorPrimaryTextActive: string;
    colorSuccessHover: string;
    colorSuccessActive: string;
    colorSuccessBg: string;
    colorSuccessBgHover: string;
    colorSuccessBorder: string;
    colorSuccessText: string;
    colorWarningHover: string;
    colorWarningActive: string;
    colorWarningBg: string;
    colorWarningBgHover: string;
    colorWarningBorder: string;
    colorWarningText: string;
    colorErrorHover: string;
    colorErrorActive: string;
    colorErrorBg: string;
    colorErrorBgHover: string;
    colorErrorBorder: string;
    colorErrorText: string;
    colorInfoHover: string;
    colorInfoActive: string;
    colorInfoBg: string;
    colorInfoBorder: string;
    colorInfoText: string;
    colorLinkHover: string;
    colorLinkActive: string;
    fontSizeLG: number;
    fontSizeXL: number;
    fontSizeSM: number;
    fontSizeIcon: number;
    lineHeightLG: number;
    lineHeightSM: number;
    borderRadiusXS: number;
    borderRadiusSM: number;
    borderRadiusLG: number;
    borderRadiusOuter: number;
    lineWidthFocus: number;
    controlHeightLG: number;
    controlHeightSM: number;
    controlHeightXS: number;
    motionDurationFast: string;
    motionDurationMid: string;
    motionDurationSlow: string;
}
