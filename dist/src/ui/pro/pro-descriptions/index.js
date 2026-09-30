"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProDescriptions = ProDescriptions;
// ProDescriptions：schema 驱动的详情描述列表（Pro 菜单组件）。
// 在 Descriptions 之上加两件事：
//   1) valueType 内置渲染器 —— copy（点击写剪贴板 + 已复制回执）/ link / badge（语义点）/ date，省去手写 render；
//   2) request 异步加载 —— 挂载即拉，loading 期间整版骨架；受控 data 优先于内部 request 结果。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../../components");
const theme_1 = require("../../../theme");
const descriptions_1 = require("../../descriptions");
const skeleton_1 = require("../../skeleton");
const clipboard_1 = require("../../../window/clipboard");
const DOT_BY_SEMANTIC = {
    success: 'colorSuccess',
    error: 'colorError',
    warning: 'colorWarning',
    processing: 'colorPrimary',
    default: 'colorTextQuaternary',
};
function ProDescriptions(props) {
    const { title, extra, columns, data, request, reloadKey, loading: loadingProp, column, bordered, layout, style } = props;
    const { token } = (0, theme_1.useToken)();
    const [inner, setInner] = react_1.default.useState(undefined);
    const [fetching, setFetching] = react_1.default.useState(!!request && data == null);
    const row = data ?? inner;
    react_1.default.useEffect(() => {
        if (!request || data != null)
            return;
        let alive = true;
        setFetching(true);
        request().then((d) => {
            if (alive) {
                setInner(d);
                setFetching(false);
            }
        }, () => {
            if (alive)
                setFetching(false);
        });
        return () => {
            alive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [request, data, reloadKey]);
    const loading = fetching || !!loadingProp;
    const items = columns.map((c) => {
        const value = row ? row[c.dataIndex] : undefined;
        let content = value == null ? '-' : String(value);
        if (c.render) {
            content = c.render(value, row);
        }
        else if (c.valueType === 'copy') {
            content = react_1.default.createElement(CopyCell, { text: value == null ? '' : String(value) });
        }
        else if (c.valueType === 'link') {
            content = (react_1.default.createElement(components_1.Pressable, { onPress: () => { }, style: { alignSelf: 'flex-start', cursor: 'pointer' } },
                react_1.default.createElement(components_1.Text, { style: { color: token.colorPrimary } }, String(value ?? '-'))));
        }
        else if (c.valueType === 'badge') {
            content = react_1.default.createElement(BadgeCell, { value: value, spec: c.badgeColor, row: row });
        }
        return { key: c.dataIndex, label: c.label, span: c.span, children: loading ? react_1.default.createElement(skeleton_1.Skeleton, { active: true, avatar: false, title: true, paragraph: 0, style: { width: 90 } }) : content };
    });
    return (react_1.default.createElement(components_1.View, { style: style },
        react_1.default.createElement(descriptions_1.Descriptions, { title: title, extra: extra, items: items, column: column, bordered: bordered, layout: layout })));
}
/** copy 单元：值 + 复制小字，点击写剪贴板并回执 2s */
function CopyCell(props) {
    const { token } = (0, theme_1.useToken)();
    const [copied, setCopied] = react_1.default.useState(false);
    const timer = react_1.default.useRef(null);
    react_1.default.useEffect(() => () => { if (timer.current)
        clearTimeout(timer.current); }, []);
    return (react_1.default.createElement(components_1.Pressable, { style: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', cursor: 'pointer' }, onPress: () => {
            (0, clipboard_1.writeClipboard)(props.text);
            setCopied(true);
            if (timer.current)
                clearTimeout(timer.current);
            timer.current = setTimeout(() => setCopied(false), 2000);
        } },
        react_1.default.createElement(components_1.Text, { style: { color: token.colorText } }, props.text || '-'),
        react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: copied ? token.colorSuccess : token.colorTextTertiary } }, copied ? '已复制' : '复制')));
}
/** badge 单元：语义点 + 文本。badgeColor：语义映射表 / 直接色值 */
function BadgeCell(props) {
    const { token } = (0, theme_1.useToken)();
    let semantic;
    if (typeof props.spec === 'function')
        semantic = props.spec(props.value, props.row);
    else if (typeof props.spec === 'string')
        semantic = props.spec;
    else if (props.spec)
        semantic = props.spec[String(props.value)];
    const key = DOT_BY_SEMANTIC[semantic ?? ''] ?? (typeof semantic === 'string' && semantic.startsWith('#') ? semantic : undefined);
    const color = key && key in token ? token[key] : typeof semantic === 'string' && semantic.startsWith('#') ? semantic : token.colorTextQuaternary;
    return (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: token.marginXXS } },
        react_1.default.createElement(components_1.View, { style: { width: 6, height: 6, borderRadius: 3, backgroundColor: color } }),
        react_1.default.createElement(components_1.Text, { style: { color: token.colorText } }, String(props.value ?? '-'))));
}
exports.default = ProDescriptions;
