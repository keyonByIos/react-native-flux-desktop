import type { MapToken } from './maps';
/**
 * Alias Token — the ergonomic layer components actually consume.
 * Adds spacing scales and a few convenience aliases on top of MapToken.
 */
export interface AliasToken extends MapToken {
    sizeXXS: number;
    sizeXS: number;
    sizeSM: number;
    size: number;
    sizeMD: number;
    sizeLG: number;
    sizeXL: number;
    sizeXXL: number;
    padding: number;
    paddingXXS: number;
    paddingXS: number;
    paddingSM: number;
    paddingMD: number;
    paddingLG: number;
    paddingXL: number;
    paddingContentHorizontal: number;
    paddingContentVertical: number;
    paddingContentHorizontalLG: number;
    paddingContentVerticalLG: number;
    paddingContentHorizontalSM: number;
    paddingContentVerticalSM: number;
    margin: number;
    marginXXS: number;
    marginXS: number;
    marginSM: number;
    marginMD: number;
    marginLG: number;
    marginXL: number;
    marginXXL: number;
    /** Background used by "secondary / filled" surfaces (== colorFillQuaternary). */
    colorBgContainerDisabled: string;
    /** Text color used on top of the primary brand color. */
    colorTextOnPrimaryBackground: string;
    /** Focus outline ring color (translucent primary). */
    controlOutline: string;
    /** Focus outline ring width. */
    controlOutlineWidth: number;
    /** Default reset / active background for interactive controls. */
    controlItemBgHover: string;
    controlItemBgActive: string;
}
