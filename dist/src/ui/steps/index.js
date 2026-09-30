"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Steps = Steps;
// Steps：步骤条。对齐 antd v5 —— direction(横/纵) / size / labelPlacement / progressDot / 自定义 icon / 可点击 onChange / status。
// 连接线：垂直居中对齐节点中心、两端可留白、样式(实/虚/点)/颜色/粗细可配（line 属性）；完成时用 useTween 充能。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
const useTween_1 = require("../../anim/useTween");
const easing_1 = require("../../anim/easing");
/** 连接线：实线用底轨 + 补间填充；虚/点线按测得长度手动排布小段，前 filledCount 段着完成色 */
function LineFill(props) {
    const { filled, thickness: t, track, fill, horizontal, gap, gapLeft, gapRight, length, style } = props;
    const p = (0, useTween_1.useTween)(filled ? 1 : 0, 400, easing_1.easeOutCubic);
    const [len, setLen] = react_1.default.useState(0);
    const onLayout = (e) => {
        const v = horizontal ? e.nativeEvent.layout.w : e.nativeEvent.layout.h;
        setLen((prev) => (Math.abs(v - prev) > 0.5 ? v : prev));
    };
    const outer = horizontal
        ? { flex: 1, height: t, marginLeft: gapLeft ?? gap, marginRight: gapRight ?? gap }
        : { width: t, height: length ?? 0, marginTop: gap, alignSelf: 'center' };
    if (style === 'solid') {
        const pct = `${Math.round(p * 1000) / 10}%`;
        return (react_1.default.createElement(components_1.View, { onLayout: onLayout, style: [outer, { backgroundColor: track, borderRadius: t / 2, overflow: 'hidden' }] }, horizontal ? (react_1.default.createElement(components_1.View, { style: { width: pct, height: t, backgroundColor: fill } })) : (react_1.default.createElement(components_1.View, { style: { width: t, height: pct, backgroundColor: fill } }))));
    }
    // dashed / dotted：小段平铺，段长按线型区分（点为圆点，虚为短横）
    const dashW = style === 'dotted' ? t * 1.4 : t * 3;
    const dashGap = style === 'dotted' ? t * 1.1 : t * 1.8;
    const total = horizontal ? len : length ?? len;
    const count = total > 0 ? Math.max(0, Math.floor((total + dashGap) / (dashW + dashGap))) : 0;
    const filledCount = Math.round(p * count);
    const segs = [];
    for (let i = 0; i < count; i++) {
        segs.push(react_1.default.createElement(components_1.View, { key: i, style: {
                width: horizontal ? dashW : t,
                height: horizontal ? t : dashW,
                borderRadius: t / 2,
                backgroundColor: i < filledCount ? fill : track,
                marginRight: horizontal && i < count - 1 ? dashGap : 0,
                marginBottom: !horizontal && i < count - 1 ? dashGap : 0,
            } }));
    }
    return (react_1.default.createElement(components_1.View, { onLayout: onLayout, style: [outer, { flexDirection: horizontal ? 'row' : 'column', alignItems: 'center' }] }, segs));
}
function Steps(props) {
    const { token, getComponentToken } = (0, theme_1.useToken)();
    const ct = getComponentToken('Steps');
    const { current = 0, initial = 0, items = [], status = 'process', size = 'default', direction = 'horizontal', labelPlacement = 'horizontal', progressDot = false, readOnly = false, showNumber = false, onChange, style, } = props;
    const dia = size === 'small' ? ct.iconSizeSM : ct.iconSize;
    const clickable = !!onChange && !readOnly;
    // 连接线外观（缺省回退 token）
    const lineStyle = props.line?.style ?? 'solid';
    const lineW = props.line?.width ?? token.lineWidth;
    const lineTrack = props.line?.color ?? token.colorBorderSecondary;
    const lineActive = props.line?.activeColor ?? token.colorPrimary;
    const lineGap = props.line?.gap ?? token.marginXS;
    const statusOf = (i) => {
        if (i < current)
            return 'finish';
        if (i === current)
            return status === 'error' ? 'error' : 'process';
        return 'wait';
    };
    const colorOf = (st) => st === 'error'
        ? token.colorError
        : st === 'process' || st === 'finish'
            ? token.colorPrimary
            : token.colorTextQuaternary;
    /** 序号圆点 / 点状圆点 / 自定义图标 */
    const renderMarker = (st, it, i) => {
        if (it.icon != null) {
            return react_1.default.createElement(components_1.View, { style: { width: dia, height: dia, alignItems: 'center', justifyContent: 'center' } }, it.icon);
        }
        if (progressDot) {
            const dot = size === 'small' ? 5 : 7;
            const active = st === 'process' || st === 'finish';
            return (react_1.default.createElement(components_1.View, { style: {
                    width: dot,
                    height: dot,
                    borderRadius: dot / 2,
                    backgroundColor: active ? token.colorPrimary : token.colorBgContainer,
                    borderWidth: token.lineWidth * 2,
                    borderColor: active ? token.colorPrimary : token.colorBorder,
                } }));
        }
        const fg = colorOf(st);
        const solid = st === 'finish';
        return (react_1.default.createElement(components_1.View, { style: {
                display: 'flex',
                width: dia,
                height: dia,
                borderRadius: dia / 2,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: token.lineWidth,
                borderColor: solid ? 'transparent' : fg,
                backgroundColor: solid ? fg : 'transparent',
            } }, st === 'finish' && !showNumber ? (react_1.default.createElement(icon_1.Icon, { name: "check", size: dia * 0.5, color: token.colorTextOnPrimaryBackground, strokeWidth: 3 })) : st === 'error' ? (react_1.default.createElement(icon_1.Icon, { name: "close", size: dia * 0.45, color: fg, strokeWidth: 3 })) : (react_1.default.createElement(components_1.Text, { style: { fontSize: ct.iconFontSize, color: solid ? token.colorTextOnPrimaryBackground : fg, fontWeight: '500' } }, i + 1 + initial))));
    };
    const titleColor = (st) => st === 'wait' ? token.colorTextTertiary : token.colorText;
    const renderTitleBlock = (st, it, center) => (react_1.default.createElement(components_1.View, { style: center ? { alignItems: 'center' } : undefined },
        react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center' } },
            react_1.default.createElement(components_1.Text, { style: {
                    fontSize: size === 'small' ? token.fontSize : ct.titleFontSize,
                    color: titleColor(st),
                    fontWeight: st === 'process' ? '500' : '400',
                } }, it.title),
            it.subTitle != null ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextTertiary, marginLeft: token.marginXXS } }, it.subTitle)) : null),
        it.description != null ? (react_1.default.createElement(components_1.Text, { style: {
                fontSize: token.fontSizeSM,
                color: token.colorTextTertiary,
                marginTop: token.marginXXS,
                textAlign: center ? 'center' : 'left',
            } }, it.description)) : null));
    const press = (i) => clickable && !items[i].disabled ? () => onChange?.(i) : undefined;
    // ---- 竖向 ----
    if (direction === 'vertical') {
        return (react_1.default.createElement(components_1.View, { style: [{ flexDirection: 'column' }, style] }, items.map((it, i) => {
            const st = it.status ?? statusOf(i);
            const last = i === items.length - 1;
            return (react_1.default.createElement(components_1.Pressable, { key: it.key ?? i, onPress: press(i), style: { flexDirection: 'row' } },
                react_1.default.createElement(components_1.View, { style: { width: progressDot ? 16 : dia, alignItems: 'center' } },
                    renderMarker(st, it, i),
                    !last ? (react_1.default.createElement(LineFill, { filled: st === 'finish', thickness: lineW, track: lineTrack, fill: lineActive, horizontal: false, gap: lineGap, length: progressDot ? 18 : 28, style: lineStyle })) : null),
                react_1.default.createElement(components_1.View, { style: { flex: 1, marginLeft: token.marginSM, paddingBottom: last ? 0 : token.paddingLG } }, renderTitleBlock(st, it, false))));
        })));
    }
    // ---- 横向 · 标题在下（labelPlacement=vertical）----
    if (labelPlacement === 'vertical') {
        return (react_1.default.createElement(components_1.View, { style: [{ flexDirection: 'row', alignItems: 'flex-start' }, style] }, items.map((it, i) => {
            const st = it.status ?? statusOf(i);
            const last = i === items.length - 1;
            const first = i === 0;
            const beforeFilled = statusOf(i - 1) === 'finish';
            const afterFilled = st === 'finish';
            return (react_1.default.createElement(components_1.Pressable, { key: it.key ?? i, onPress: press(i), style: { flex: 1, alignItems: 'center' } },
                react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' } },
                    first ? (react_1.default.createElement(components_1.View, { style: { flex: 1 } })) : (react_1.default.createElement(LineFill, { filled: beforeFilled, thickness: lineW, track: lineTrack, fill: lineActive, horizontal: true, gap: lineGap, gapLeft: 0, gapRight: lineGap, style: lineStyle })),
                    renderMarker(st, it, i),
                    last ? (react_1.default.createElement(components_1.View, { style: { flex: 1 } })) : (react_1.default.createElement(LineFill, { filled: afterFilled, thickness: lineW, track: lineTrack, fill: lineActive, horizontal: true, gap: lineGap, gapLeft: lineGap, gapRight: 0, style: lineStyle }))),
                react_1.default.createElement(components_1.View, { style: { alignSelf: 'stretch', alignItems: 'center', marginTop: token.marginXS } }, renderTitleBlock(st, it, true))));
        })));
    }
    // ---- 横向 · 标题在右（默认）：标题行高 = 圆点直径，使线与标题都落在节点垂直中心线上 ----
    return (react_1.default.createElement(components_1.View, { style: [{ flexDirection: 'row', alignItems: 'flex-start' }, style] }, items.map((it, i) => {
        const st = it.status ?? statusOf(i);
        const last = i === items.length - 1;
        return (react_1.default.createElement(components_1.Pressable, { key: it.key ?? i, onPress: press(i), style: { flex: last ? undefined : 1, flexDirection: 'row', alignItems: 'flex-start' } },
            react_1.default.createElement(components_1.View, { style: { height: dia, justifyContent: 'center', alignItems: 'center' } }, renderMarker(st, it, i)),
            react_1.default.createElement(components_1.View, { style: { flex: last ? 0 : 1, marginLeft: token.marginXS } },
                react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', height: dia } },
                    react_1.default.createElement(components_1.Text, { style: {
                            fontSize: size === 'small' ? token.fontSize : ct.titleFontSize,
                            color: titleColor(st),
                            fontWeight: st === 'process' ? '500' : '400',
                        } }, it.title),
                    it.subTitle != null ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextTertiary, marginLeft: token.marginXXS } }, it.subTitle)) : null,
                    !last ? (react_1.default.createElement(LineFill, { filled: st === 'finish', thickness: lineW, track: lineTrack, fill: lineActive, horizontal: true, gap: lineGap, style: lineStyle })) : null),
                it.description != null ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextTertiary, marginTop: token.marginXXS } }, it.description)) : null)));
    })));
}
