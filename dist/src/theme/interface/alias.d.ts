import type { MapToken } from './maps';

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

    colorBgContainerDisabled: string;

    colorTextOnPrimaryBackground: string;

    controlOutline: string;

    controlOutlineWidth: number;

    controlItemBgHover: string;
    controlItemBgActive: string;
}
