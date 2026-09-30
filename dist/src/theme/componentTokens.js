"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildComponentTokens = buildComponentTokens;
const shared_1 = require("./themes/shared");
/** Default component tokens derived from the current AliasToken. */
function buildComponentTokens(alias, userComponents = {}) {
    // Switch geometry: handle inset by a thin margin, track sized to a normal
    // pill proportion (antd-like ~46x26) instead of the old oversized formula.
    const switchHandle = alias.controlHeightSM - alias.lineWidth * 4;
    const switchMargin = alias.lineWidth * 3;
    // Segmented: in dark mode the selected pill must read as *raised* (lighter
    // than its groove). colorBgElevated is darker than the fill-based track there,
    // so swap the roles: subtle elevated track + lighter fill thumb.
    const dark = (0, shared_1.isDarkTheme)(alias);
    const segTrack = dark ? alias.colorBgElevated : alias.colorFillTertiary;
    const segThumb = dark ? alias.colorFillTertiary : alias.colorBgElevated;
    const defaults = {
        Button: {
            token: {
                borderRadius: alias.borderRadius,
                fontWeight: 500,
                paddingInline: alias.paddingContentHorizontal - alias.lineWidth,
                paddingBlock: Math.max((alias.controlHeight - alias.fontSize * alias.lineHeight) / 2 -
                    alias.lineWidth, 0),
                contentFontSize: alias.fontSize,
                contentFontSizeSM: alias.fontSizeSM,
                contentFontSizeLG: alias.fontSizeLG,
                controlHeightSM: alias.controlHeightSM,
                controlHeightLG: alias.controlHeightLG,
                solidTextColor: alias.colorTextOnPrimaryBackground,
                defaultBorderColor: alias.colorBorder,
                defaultColor: alias.colorText,
                defaultBg: alias.colorBgContainer,
            },
        },
        Input: {
            token: {
                borderRadius: alias.borderRadius,
                paddingInline: alias.paddingContentHorizontal - alias.lineWidth,
                paddingBlock: alias.paddingContentVertical / 2,
                controlHeight: alias.controlHeight,
                activeBorderColor: alias.colorPrimaryHover,
                hoverBorderColor: alias.colorPrimaryBorderHover,
                activeBg: alias.colorBgContainer,
                colorFillAlertDialogBg: alias.colorFillQuaternary,
            },
        },
        Switch: {
            token: {
                minLineWidth: switchHandle * 2 + switchMargin * 2,
                innerMinMargin: switchMargin,
                handleSize: switchHandle,
                color: alias.colorTextQuaternary,
                handleBg: alias.colorBgContainer,
                loadingBg: alias.colorFillSecondary,
            },
        },
        Tag: {
            token: {
                borderRadiusSM: alias.borderRadiusSM,
                defaultBg: alias.colorFillQuaternary,
                defaultColor: alias.colorText,
                borderStyle: 'solid',
            },
        },
        Avatar: {
            token: {
                containerSize: alias.controlHeightLG,
                containerSizeLG: alias.controlHeightLG + 20,
                containerSizeSM: alias.controlHeightSM,
                borderRadius: alias.borderRadius,
                textFontSize: alias.fontSize,
                textFontSizeLG: alias.fontSizeLG + 6,
                textFontSizeSM: alias.fontSizeSM,
            },
        },
        Badge: {
            token: {
                indicatorHeight: 20,
                indicatorHeightSM: alias.fontSizeSM,
                dotSize: alias.lineWidth * 4,
                textFontSize: alias.fontSizeSM,
                colorErrorShadow: alias.colorErrorHover,
            },
        },
        Card: {
            token: {
                borderRadiusLG: alias.borderRadiusLG,
                paddingLG: alias.paddingLG,
                headerBg: 'transparent',
                headerFontSize: alias.fontSizeLG,
                actionsBg: alias.colorBgContainer,
            },
        },
        Checkbox: {
            token: {
                borderRadiusSM: alias.borderRadiusSM,
                controlInteractiveSize: 20,
                colorPrimary: alias.colorPrimary,
            },
        },
        Cell: {
            token: {
                paddingBlock: alias.paddingSM,
                paddingInline: alias.padding,
                fontSizeDesc: alias.fontSizeSM,
                descriptionColor: alias.colorTextTertiary,
                activeBg: alias.colorFillTertiary,
            },
        },
        Segmented: {
            token: {
                borderRadius: alias.borderRadius,
                trackBg: segTrack,
                thumbBg: segThumb,
                itemPaddingBlock: alias.paddingXXS,
            },
        },
        Radio: {
            token: {
                dotSize: 16,
                size: 20,
                colorPrimary: alias.colorPrimary,
            },
        },
        Stepper: {
            token: {
                buttonWidth: alias.controlHeight,
                inputWidth: alias.controlHeight * 1.5,
                height: alias.controlHeight,
                borderRadius: alias.borderRadius,
                inputBg: alias.colorBgContainer,
            },
        },
        SearchBar: {
            token: {
                borderRadius: alias.borderRadiusLG,
                paddingInline: alias.paddingSM,
                height: alias.controlHeight,
                background: alias.colorFillSecondary,
            },
        },
        NoticeBar: {
            token: {
                borderRadius: alias.borderRadius,
                paddingInline: alias.paddingSM,
                textColor: alias.colorWarningText,
                closableColor: alias.colorTextTertiary,
            },
        },
        Progress: {
            token: {
                lineSize: alias.lineWidth * 8,
                lineSizeSM: alias.lineWidth * 4,
                lineSizeLG: alias.lineWidth * 12,
                lineTrackSize: alias.lineWidth * 8,
                circleSize: 120,
                remainingColor: alias.colorFillSecondary,
                innerFontSize: alias.fontSize,
            },
        },
        Empty: {
            token: {
                color: alias.colorTextQuaternary,
                fontSize: alias.fontSize,
            },
        },
        Result: {
            token: {
                iconFontSize: alias.fontSize * 3,
                titleFontSize: alias.fontSizeLG,
                subtitleFontSize: alias.fontSize,
            },
        },
        Descriptions: {
            token: {
                titleFontSize: alias.fontSizeLG,
                itemPaddingBottom: alias.paddingSM,
                labelColor: alias.colorTextTertiary,
                contentColor: alias.colorText,
                labelBg: alias.colorFillQuaternary,
                cellPaddingInline: alias.padding,
                cellPaddingBlock: alias.paddingXS,
                borderRadius: alias.borderRadiusLG,
            },
        },
        Timeline: {
            token: {
                widthSM: alias.lineWidth * 3,
                fontSize: alias.fontSize,
            },
        },
        Steps: {
            token: {
                iconFontSize: alias.fontSizeLG,
                titleFontSize: alias.fontSize,
                iconSize: alias.fontSize * 2,
                iconSizeSM: alias.fontSize + 10,
            },
        },
        Statistic: {
            token: {
                titleFontSize: alias.fontSize,
                contentFontSize: alias.fontSizeXL,
            },
        },
        Skeleton: {
            token: {
                borderRadius: alias.borderRadiusSM,
                gradientFromColor: alias.colorFillContent,
                gradientToColor: alias.colorFillTertiary,
            },
        },
        Menu: {
            token: {
                itemHeight: alias.controlHeightLG,
                itemPaddingInline: alias.padding,
                itemMarginInline: alias.marginXXS,
                iconMarginInlineEnd: alias.marginSM,
                iconSize: alias.fontSize,
                itemFontSize: alias.fontSize,
                inlineIndent: alias.padding + alias.paddingXS,
                itemBorderRadius: alias.borderRadius,
                expandIconSize: alias.fontSize,
                groupTitleFontSize: alias.fontSizeSM,
                groupTitleHeight: alias.controlHeightSM,
                darkBg: '#001529',
                darkItemColor: 'rgba(255,255,255,0.65)',
                darkHoverBg: 'rgba(255,255,255,0.08)',
                darkActiveBg: 'rgba(255,255,255,0.15)',
                darkSelectedBg: alias.colorPrimary,
                darkSelectedColor: '#ffffff',
                darkGroupTitleColor: 'rgba(255,255,255,0.45)',
                darkDivider: 'rgba(255,255,255,0.12)',
            },
        },
        Tabs: {
            token: {
                itemPaddingInline: alias.padding,
                itemPaddingBlock: alias.paddingSM,
                inkBarSize: alias.lineWidth * 2,
                horizontalItemGutter: alias.marginLG,
            },
        },
        Alert: {
            token: {
                borderRadius: alias.borderRadius,
                paddingBlock: alias.paddingXS,
                paddingInline: alias.paddingSM,
                withDescriptionPaddingBlock: alias.paddingSM,
                withDescriptionPaddingInline: alias.paddingMD,
            },
        },
        Popup: {
            token: {
                borderRadiusLG: alias.borderRadiusLG,
                closeIconColor: alias.colorTextTertiary,
                maskAlpha: 0.55,
            },
        },
        Modal: {
            token: {
                borderRadiusLG: alias.borderRadiusLG,
                titleFontSize: alias.fontSizeLG,
                actionHeight: alias.controlHeightLG,
            },
        },
    };
    // shallow-merge user overrides per component (override is { token: {...} })
    Object.keys(defaults).forEach((key) => {
        const override = userComponents[key]?.token;
        if (override) {
            const target = defaults[key];
            target.token = { ...target.token, ...override };
        }
    });
    return defaults;
}
