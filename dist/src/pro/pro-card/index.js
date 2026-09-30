"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProCard = void 0;
exports.ProCardPanel = ProCardPanel;
exports.ProCardBase = ProCardBase;
// ProCard：中后台「页面区块」容器，比 Card 更贴业务的一层封装。
// 相比原子 Card 的增量能力：
//   1) 页头三件套 —— title + subtitle（次级灰字）+ tooltip（帮助圈），extra 右侧操作区自动对齐；
//   2) split 分栏 —— 传 'vertical' 子面板横向并排（竖分隔线）、'horizontal' 纵向堆叠（横分隔线），
//      配合 ProCard.Panel 做等分栅格，无需再套 Row/Col；
//   3) ghost —— 去底去边、仅留内容间距，用于把多个 ProCard 拼进同一灰底页而不显“套娃卡片”；
//   4) collapsible —— 页头可点折叠，body 高度收放（受控 open / 非受控 defaultOpen 两态）。
// 几何、颜色一律取自 token，明暗/紧凑自适应；零第三方依赖。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const skeleton_1 = require("../../ui/skeleton");
/** 子面板：在 split 布局下作为一格；单独使用等价于一块带标题的分区 */
function ProCardPanel(props) {
    const { token } = (0, theme_1.useToken)();
    const { title, subtitle, extra, tooltip, loading, flex = 1, style, bodyStyle, children } = props;
    return (react_1.default.createElement(components_1.View, { style: [{ flex, gap: token.marginXS, padding: token.paddingLG }, style] },
        title != null || extra != null ? (react_1.default.createElement(HeaderRow, { token: token, title: title, subtitle: subtitle, tooltip: tooltip, extra: extra })) : null,
        loading ? react_1.default.createElement(skeleton_1.Skeleton, { active: true, avatar: false, title: false, paragraph: 3 }) : children,
        react_1.default.createElement(components_1.View, { style: bodyStyle })));
}
function HeaderRow(props) {
    const { token, title, subtitle, tooltip, extra } = props;
    return (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: token.marginXS } },
        react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: token.marginXS, flexShrink: 1 } },
            react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText }, numberOfLines: 1 }, title),
            tooltip != null ? react_1.default.createElement(HelpTip, { token: token, tip: tooltip }) : null,
            subtitle != null ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextTertiary }, numberOfLines: 1 }, subtitle)) : null),
        extra != null ? react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: token.marginXS } }, extra) : null));
}
/** 标题后的帮助圈：小圆 + 问号；tip 为字符串时在圈后补一截浅色小字 */
function HelpTip(props) {
    const { token, tip } = props;
    return (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: 4 } },
        react_1.default.createElement(components_1.View, { style: {
                width: 14,
                height: 14,
                borderRadius: 7,
                borderWidth: 1,
                borderColor: token.colorTextQuaternary,
                alignItems: 'center',
                justifyContent: 'center',
            } },
            react_1.default.createElement(components_1.Text, { style: { fontSize: 10, lineHeight: 14, color: token.colorTextQuaternary } }, "?")),
        typeof tip === 'string' ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextTertiary } }, tip)) : null));
}
function ProCardBase(props) {
    const { token } = (0, theme_1.useToken)();
    const { title, subtitle, tooltip, extra, loading, ghost, bordered = true, split, collapsible, defaultOpen = true, open: openProp, onOpenChange, onClick, style, headerStyle, bodyStyle, children, } = props;
    const [innerOpen, setInnerOpen] = react_1.default.useState(defaultOpen);
    const open = openProp ?? innerOpen;
    const toggle = () => {
        const next = !open;
        if (openProp == null)
            setInnerOpen(next);
        onOpenChange?.(next);
    };
    const hasHeader = title != null || subtitle != null || extra != null || collapsible;
    const radius = token.borderRadiusLG;
    // split 分栏：把 children 归一成数组，相邻之间插一条分隔线
    const cells = react_1.default.Children.toArray(children);
    const dividerColor = token.colorSplit;
    let body;
    if (split && cells.length > 1) {
        const dir = split === 'vertical' ? 'row' : 'column';
        body = (react_1.default.createElement(components_1.View, { style: { flexDirection: dir } }, cells.map((c, i) => (react_1.default.createElement(react_1.default.Fragment, { key: i },
            i > 0 ? (react_1.default.createElement(components_1.View, { style: split === 'vertical'
                    ? { width: 1, alignSelf: 'stretch', backgroundColor: dividerColor }
                    : { height: 1, alignSelf: 'stretch', backgroundColor: dividerColor } })) : null,
            c)))));
    }
    else {
        body = children;
    }
    const card = (react_1.default.createElement(components_1.View, { style: [
            ghost
                ? { gap: token.marginSM }
                : {
                    borderRadius: radius,
                    borderWidth: bordered ? token.lineWidth : 0,
                    borderColor: token.colorBorderSecondary,
                    backgroundColor: token.colorBgContainer,
                    overflow: 'hidden',
                },
            style,
        ] },
        hasHeader ? (react_1.default.createElement(components_1.Pressable, { disabled: !collapsible, onPress: collapsible ? toggle : undefined, style: [
                {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: ghost ? 0 : token.paddingLG,
                    paddingVertical: token.padding,
                    gap: token.marginXS,
                },
                !ghost && (open || !collapsible) && cells.length > 0
                    ? { borderBottomWidth: token.lineWidth, borderBottomColor: token.colorBorderSecondary }
                    : undefined,
                headerStyle,
            ] },
            react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: token.marginXS, flexShrink: 1 } },
                collapsible ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextTertiary, width: 12 } }, open ? '▾' : '▸')) : null,
                react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText }, numberOfLines: 1 }, title),
                tooltip != null ? react_1.default.createElement(HelpTip, { token: token, tip: tooltip }) : null,
                subtitle != null ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextTertiary }, numberOfLines: 1 }, subtitle)) : null),
            extra != null ? react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: token.marginXS } }, extra) : null)) : null,
        !hasHeader || open ? (react_1.default.createElement(components_1.View, { style: [ghost ? undefined : { padding: split ? 0 : token.paddingLG }, bodyStyle] }, loading ? react_1.default.createElement(skeleton_1.Skeleton, { active: true, avatar: false, title: false, paragraph: 3 }) : body)) : null));
    if (!onClick)
        return card;
    return react_1.default.createElement(components_1.Pressable, { onPress: onClick, style: { cursor: 'pointer' } }, card);
}
/** ProCard + ProCard.Panel 复合导出 */
exports.ProCard = Object.assign(ProCardBase, { Panel: ProCardPanel });
exports.default = exports.ProCard;
