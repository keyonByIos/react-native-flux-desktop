"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Menu = Menu;
// Menu：参考 antd v5 的 items / mode / theme / selectedKeys / openKeys API。
// 自绘管线没有浮层，所以 vertical / horizontal 的弹出子菜单暂不做，
// inline（子菜单就地展开、逐级缩进）是这里的主形态，也最适合左侧导航。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
const useTween_1 = require("../../anim/useTween");
const ticker_1 = require("../../anim/ticker");
const ConfigContext_1 = require("../../theme/ConfigContext");
const easing_1 = require("../../anim/easing");
function kindOf(it) {
    if (it.type)
        return it.type;
    return it.children && it.children.length ? 'submenu' : 'item';
}
function MenuRow(props) {
    const { item, kind, selected, opened, depth, ct, token, pal, onPress } = props;
    const [hover, setHover] = react_1.default.useState(false);
    const [pressed, setPressed] = react_1.default.useState(false);
    const disabled = !!item.disabled;
    // 前景色：危险 > 选中 > 常规 > 禁用
    let fg = pal.item;
    if (item.danger)
        fg = pal.danger;
    // 选中项为「主色/危险色实底 + 白字」，明暗主题一致，故选中时前景恒取 selColor（白）
    if (selected)
        fg = pal.selColor;
    if (disabled)
        fg = pal.disabled;
    // 背景淡变：不再硬切 backgroundColor，而是叠两层同尺寸绝对定位色块，用 useTween 平滑各自 opacity——
    // 选中层(selBg) + 悬停/按压层(hover/active)。悬停层在选中时不叠加(保持选中实底)，按压色优先于悬停色。
    const selAmt = (0, useTween_1.useTween)(selected && !disabled ? 1 : 0, 200, easing_1.easeOutCubic);
    const hoverAmt = (0, useTween_1.useTween)(!disabled && !selected && (pressed || hover) ? 1 : 0, 160, easing_1.easeOutCubic);
    const hoverBg = pressed ? pal.active : pal.hover;
    // 展开图标旋转：收起 0°(向下) ↔ 展开 180°(向上)，随状态缓动（Icon 支持任意角度）
    const chevronDeg = (0, useTween_1.useTween)(opened ? 180 : 0, 200, easing_1.easeOutCubic);
    const box = {
        flexDirection: 'row',
        alignItems: 'center',
        height: ct.itemHeight,
        marginHorizontal: ct.itemMarginInline,
        borderRadius: ct.itemBorderRadius,
        paddingLeft: ct.itemPaddingInline + depth * ct.inlineIndent,
        paddingRight: ct.itemPaddingInline,
        opacity: disabled ? 0.5 : 1,
    };
    const layer = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: ct.itemBorderRadius,
    };
    const iconNode = item.icon == null ? null : (react_1.default.createElement(components_1.View, { style: {
            // 字符串图标固定列宽对齐；自定义节点图标不约束宽度，让其自适应尺寸
            width: typeof item.icon === 'string' ? ct.iconSize : undefined,
            marginRight: ct.iconMarginInlineEnd,
            alignItems: 'center',
        } }, typeof item.icon === 'string' ? (react_1.default.createElement(icon_1.Icon, { name: item.icon, size: ct.iconSize, color: fg })) : (item.icon)));
    return (react_1.default.createElement(components_1.Pressable, { disabled: disabled, style: box, onPress: onPress, onPressIn: () => setPressed(true), onPressOut: () => setPressed(false), onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false) },
        react_1.default.createElement(components_1.View, { style: [layer, { backgroundColor: item.danger ? pal.selDangerBg : pal.selBg, opacity: selAmt }] }),
        react_1.default.createElement(components_1.View, { style: [layer, { backgroundColor: hoverBg, opacity: hoverAmt }] }),
        iconNode,
        typeof item.label === 'string' || typeof item.label === 'number' ? (react_1.default.createElement(components_1.Text, { numberOfLines: 1, style: {
                flex: 1,
                fontSize: ct.itemFontSize,
                fontWeight: selected ? '500' : '400',
                color: fg,
            } }, item.label)) : (
        /* 自定义节点：label 传任意 ReactNode 时直接渲染（不能塑进 Text，否则本管线内 View 塑 Text 会塔陷） */
        react_1.default.createElement(components_1.View, { style: { flex: 1 } }, item.label)),
        kind === 'submenu' ? (react_1.default.createElement(icon_1.Icon, { name: "down", rotate: chevronDeg, size: ct.expandIconSize, color: disabled ? pal.disabled : fg, strokeWidth: 2.5 })) : null));
}
function GroupTitle(props) {
    const { label, depth, ct, pal } = props;
    return (react_1.default.createElement(components_1.View, { style: {
            height: ct.groupTitleHeight,
            justifyContent: 'center',
            paddingHorizontal: ct.itemPaddingInline + depth * ct.inlineIndent,
        } },
        react_1.default.createElement(components_1.Text, { style: { fontSize: ct.groupTitleFontSize, color: pal.group } }, label)));
}
// ---------------------------------------------------------------------------
// 子菜单就地展开的高度动画容器：外层 height 补间 + overflow:hidden 裁切，
// 内层绝对定位脱离流按自身内容量高（避开 height:0 把子 Text 塔成 0 高的坑）。
// 关键：补间只服务于“开/关切换”那一次 0↔实测高的迁移；已展开期间内容高变化
// （嵌套二级展开逐帧撑高一级内容）时显示高直接跟随——若也拿 useTween 追移动目标，
// onLayout 每帧改 target → 补间每帧从头重启，一级高度永远滞后于内容被 overflow 裁住，
// 二级展开就表现为明显卡顿（收起时滞后方向是“高大于内容”不裁切，所以收起不卡）。
// ---------------------------------------------------------------------------
function CollapseBox(props) {
    const { opened, children } = props;
    const enabled = (0, ConfigContext_1.useAnimationEnabled)();
    const [contentH, setContentH] = react_1.default.useState(0);
    const [h, setH] = react_1.default.useState(opened ? contentH : 0);
    const hRef = react_1.default.useRef(h);
    hRef.current = h;
    const contentHRef = react_1.default.useRef(contentH);
    contentHRef.current = contentH;
    const animRef = react_1.default.useRef(false); // 开/关补间进行中
    const fade = (0, useTween_1.useTween)(opened ? 1 : 0, 200, easing_1.easeOutCubic);
    // 开/关切换：做一次 240ms 高度补间（0 ↔ 切换瞬间的实测高）
    react_1.default.useEffect(() => {
        const to = opened ? contentHRef.current : 0;
        if (!enabled) {
            setH(to);
            return;
        }
        const from = hRef.current;
        if (from === to)
            return;
        let start = null;
        let stop = () => { };
        animRef.current = true;
        stop = (0, ticker_1.subscribe)((now) => {
            if (start == null)
                start = now;
            const t = (now - start) / 240;
            if (t >= 1) {
                // 落定时对齐最新实测高（过渡期间嵌套增高的尾巴一并吃掉，后续交给跟随 effect）
                setH(opened ? contentHRef.current : 0);
                animRef.current = false;
                stop();
            }
            else {
                setH(from + (to - from) * (0, easing_1.easeOutCubic)(t));
            }
        });
        return () => {
            animRef.current = false;
            stop();
        };
    }, [opened, enabled]);
    // 已展开且无进行中补间：显示高逐帧直接跟随实测高（不重启动画、不滞后、不裁切）
    react_1.default.useEffect(() => {
        if (opened && !animRef.current)
            setH((p) => (p === contentH ? p : contentH));
    }, [opened, contentH]);
    return (react_1.default.createElement(components_1.View, { style: { height: h, overflow: 'hidden' } },
        react_1.default.createElement(components_1.View, { onLayout: (e) => {
                const nh = e.nativeEvent.layout.h;
                setContentH((prev) => (Math.abs(nh - prev) > 0.5 ? nh : prev));
            }, style: { position: 'absolute', top: 0, left: 0, right: 0, opacity: fade } }, children)));
}
// ---------------------------------------------------------------------------
// Menu 主体
// ---------------------------------------------------------------------------
function Menu(props) {
    const { token, getComponentToken } = (0, theme_1.useToken)();
    const ct = getComponentToken('Menu');
    const { items, theme = 'light', selectedKeys, defaultSelectedKeys = [], openKeys, defaultOpenKeys = [], accordion = false, onClick, onSelect, onOpenChange, style, } = props;
    const [innerSel, setInnerSel] = react_1.default.useState(defaultSelectedKeys);
    const [innerOpen, setInnerOpen] = react_1.default.useState(defaultOpenKeys);
    const sel = selectedKeys !== undefined ? selectedKeys : innerSel;
    const open = openKeys !== undefined ? openKeys : innerOpen;
    // 手风琴支撑：key → 所属根级子菜单 key 的映射（仅含根级子菜单的后代），用于展开某根级时剪掉其余根级及其后代。
    const rootAncestor = react_1.default.useMemo(() => {
        const map = new Map();
        const walk = (list, root) => {
            for (const it of list) {
                if (root !== null)
                    map.set(it.key, root);
                if (it.children) {
                    const childRoot = root !== null ? root : kindOf(it) === 'submenu' ? it.key : null;
                    walk(it.children, childRoot);
                }
            }
        };
        walk(items, null);
        return map;
    }, [items]);
    // 是否根级子菜单（顶层、可展开）；手风琴仅作用于这类 key。
    const isRootSubmenu = (key) => items.some((it) => it.key === key && kindOf(it) === 'submenu');
    const pal = theme === 'dark'
        ? {
            bg: ct.darkBg,
            item: ct.darkItemColor,
            hover: ct.darkHoverBg,
            active: ct.darkActiveBg,
            selBg: ct.darkSelectedBg,
            selColor: ct.darkSelectedColor,
            selDangerBg: token.colorError,
            danger: token.colorError,
            disabled: 'rgba(255,255,255,0.30)',
            group: ct.darkGroupTitleColor,
            divider: ct.darkDivider,
        }
        : {
            bg: 'transparent',
            item: token.colorText,
            hover: token.controlItemBgHover,
            active: token.colorFillSecondary,
            selBg: token.colorPrimary,
            selColor: token.colorTextLightSolid,
            selDangerBg: token.colorError,
            danger: token.colorError,
            disabled: token.colorTextQuaternary,
            group: token.colorTextTertiary,
            divider: token.colorSplit,
        };
    function toggleOpen(key) {
        let next;
        if (accordion && isRootSubmenu(key)) {
            // 手风琴（仅限根目录）：展开某根级→只保留该根子树内已开的深层 key + 本 key；收起→连本 key 及其后代一并剪掉。
            if (open.includes(key)) {
                next = open.filter((k) => k !== key && rootAncestor.get(k) !== key);
            }
            else {
                next = [...open.filter((k) => rootAncestor.get(k) === key), key];
            }
        }
        else {
            next = open.includes(key) ? open.filter((k) => k !== key) : [...open, key];
        }
        if (openKeys === undefined)
            setInnerOpen(next);
        onOpenChange && onOpenChange(next);
    }
    function selectItem(key, keyPath) {
        if (selectedKeys === undefined)
            setInnerSel([key]);
        const info = { key, keyPath };
        onSelect && onSelect(info);
        onClick && onClick(info);
    }
    const renderList = (list, depth, parentPath) => {
        const out = [];
        for (const it of list) {
            const kind = kindOf(it);
            const keyPath = [it.key, ...parentPath];
            if (kind === 'divider') {
                out.push(react_1.default.createElement(components_1.View, { key: `div-${it.key}`, style: {
                        height: token.lineWidth,
                        backgroundColor: pal.divider,
                        marginVertical: ct.itemMarginInline + ct.inlineIndent * 0,
                        marginLeft: ct.itemMarginInline + depth * ct.inlineIndent,
                        marginRight: ct.itemMarginInline,
                    } }));
                continue;
            }
            if (kind === 'group') {
                out.push(react_1.default.createElement(GroupTitle, { key: `grp-${it.key}`, label: it.label, depth: depth, ct: ct, pal: pal }));
                if (it.children)
                    out.push(...renderList(it.children, depth, keyPath));
                continue;
            }
            const selected = sel.includes(it.key);
            const opened = open.includes(it.key);
            const row = (react_1.default.createElement(MenuRow, { item: it, kind: kind, selected: selected, opened: opened, depth: depth, ct: ct, token: token, pal: pal, onPress: () => (kind === 'submenu' ? toggleOpen(it.key) : selectItem(it.key, keyPath)) }));
            if (kind === 'submenu') {
                // 子菜单：行 + 就地高度动画容器（常驻渲染，收起时 height→0 但内层仍量高，首次展开不跳变）
                out.push(react_1.default.createElement(components_1.View, { key: it.key },
                    row,
                    react_1.default.createElement(CollapseBox, { opened: opened }, it.children ? renderList(it.children, depth + 1, keyPath) : null)));
            }
            else {
                out.push(react_1.default.createElement(react_1.default.Fragment, { key: it.key }, row));
            }
        }
        return out;
    };
    return (react_1.default.createElement(components_1.View, { style: [{ backgroundColor: pal.bg, paddingVertical: ct.itemMarginInline }, style] }, renderList(items, 0, [])));
}
