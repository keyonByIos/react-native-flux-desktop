"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckCardGroup = exports.CheckCard = void 0;
// CheckCard：可勾选的卡片，用于「选项即卡片」的选择场景（模板选择、筛选标签、规格选择…）。
// 单卡 CheckCard 可受控（checked/onChange）；一组用 CheckCard.Group：
//   既支持 options 数据驱动（title/description/value/avatar），也支持手写子 CheckCard；
//   multiple 决定单选/多选，value 分别为 string | string[]。
// 选中标记：主色描边 + 右上角 Badge.Ribbon 绶带内嵌白色对勾（Icon check）；disabled 降透明并屏蔽点击。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../../ui/icon");
const badge_1 = require("../../ui/badge");
function AvatarDot(props) {
    const { token, avatar } = props;
    const size = 34;
    if (typeof avatar === 'string' || typeof avatar === 'number') {
        return (react_1.default.createElement(components_1.View, { style: { width: size, height: size, borderRadius: size / 2, backgroundColor: token.colorFillSecondary, alignItems: 'center', justifyContent: 'center' } },
            react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeLG, color: token.colorTextSecondary } }, String(avatar).slice(0, 1))));
    }
    return react_1.default.createElement(components_1.View, { style: { width: size, height: size } }, avatar);
}
function CheckCardBody(props) {
    const { token, title, description, avatar, cover, checked, disabled, onChange, onPress, width, style, children } = props;
    const borderColor = checked ? token.colorPrimary : token.colorBorderSecondary;
    const card = (react_1.default.createElement(components_1.Pressable, { disabled: disabled, onPress: onPress ?? (onChange ? () => onChange(!checked) : undefined), style: [
            {
                width: '100%',
                borderRadius: token.borderRadius,
                borderWidth: 1,
                borderColor,
                backgroundColor: token.colorBgContainer,
                overflow: 'hidden',
                opacity: disabled ? 0.45 : 1,
                cursor: disabled ? 'default' : 'pointer',
            },
            style,
        ] },
        cover != null ? react_1.default.createElement(components_1.View, { style: { width: '100%' } }, cover) : null,
        react_1.default.createElement(components_1.View, { style: { padding: token.padding, flexDirection: 'row', alignItems: 'flex-start', gap: token.marginXS } },
            avatar != null ? react_1.default.createElement(AvatarDot, { token: token, avatar: avatar }) : null,
            react_1.default.createElement(components_1.View, { style: { flex: 1, gap: token.marginXXS } },
                title != null ? react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, fontWeight: '600', color: token.colorText } }, title) : null,
                description != null ? react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextTertiary } }, description) : null,
                children))));
    // 绶带放在卡片（overflow:hidden）外层，才能与卡片圆角贴合不被裁；仅选中时挂勾图标。
    return (react_1.default.createElement(badge_1.Badge.Ribbon, { placement: "end", color: token.colorPrimary, icon: checked ? react_1.default.createElement(icon_1.Icon, { name: "check", size: 12, color: token.colorTextLightSolid, strokeWidth: 3 }) : undefined, style: { width: width ?? '100%' } }, card));
}
function CheckCardFn(props) {
    const { token } = (0, theme_1.useToken)();
    return react_1.default.createElement(CheckCardBody, { ...props, token: token });
}
function GroupBase(props) {
    const { token } = (0, theme_1.useToken)();
    const { options, value: valueProp, defaultValue, onChange, multiple, disabled, itemWidth = 220, style, children } = props;
    const norm = (v) => v == null ? [] : Array.isArray(v) ? v : [v];
    const [inner, setInner] = react_1.default.useState(() => norm(valueProp ?? defaultValue));
    const controlled = valueProp !== undefined;
    const selected = controlled ? norm(valueProp) : inner;
    const toggle = (val) => {
        let next;
        if (multiple) {
            next = selected.indexOf(val) >= 0 ? selected.filter((x) => x !== val) : [...selected, val];
        }
        else {
            next = selected.indexOf(val) >= 0 ? [] : [val];
        }
        if (!controlled)
            setInner(next);
        onChange?.(multiple ? next : next[0]);
    };
    const content = options && options.length
        ? options.map((o) => (react_1.default.createElement(components_1.View, { key: String(o.value), style: { width: itemWidth } },
            react_1.default.createElement(CheckCardBody, { token: token, title: o.title, description: o.description, avatar: o.avatar, checked: selected.indexOf(o.value) >= 0, disabled: disabled || o.disabled, onPress: () => toggle(o.value) }))))
        : react_1.default.Children.map(children, (c) => react_1.default.isValidElement(c)
            ? (react_1.default.createElement(components_1.View, { style: { width: itemWidth } }, react_1.default.cloneElement(c, {
                checked: selected.indexOf(c.props.value) >= 0,
                onPress: () => toggle(c.props.value),
                disabled: disabled || c.props.disabled,
            })))
            : c);
    return react_1.default.createElement(components_1.View, { style: [{ flexDirection: 'row', flexWrap: 'wrap', gap: token.marginSM }, style] }, content);
}
/** CheckCard + CheckCard.Group 复合导出 */
exports.CheckCard = Object.assign(CheckCardFn, { Group: GroupBase });
exports.CheckCardGroup = GroupBase;
exports.default = exports.CheckCard;
