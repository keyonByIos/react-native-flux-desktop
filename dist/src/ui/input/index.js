"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = Input;
// INPUT：文本输入框。这是自绘栈里最麻烦的一块 I/O 的落地端——窗口层（host）把键盘/IME 事件
// 路由到当前聚焦字段，本组件实现 EditableController 挂到根节点 __input 上，负责：
//   受控/非受控值、光标（内联竖条 + 闪烁）、点击落位、选区替换、退格/删除、方向/Home/End、
//   Enter(onPressEnter)/Escape(失焦)、maxLength、allowClear、前后缀、尺寸/校验态、IME 组合显示。
// 注意根节点用 intrinsic 'view' + ref 直挂场景节点（View 是函数组件不转发 ref），
// 因为 host 命中后要能从 SceneNode 上取回 __input 控制器。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const textLayout_1 = require("../../paint/textLayout");
const clipboard_1 = require("../../window/clipboard");
const contextmenu_1 = require("../../window/contextmenu");
const textinput_1 = require("../../events/textinput");
function Input(props) {
    const { token } = (0, theme_1.useToken)();
    const { value, defaultValue = '', placeholder = '', disabled, readOnly, maxLength, autoFocus, size = 'middle', status, prefix, suffix, allowClear, style, onChange, onPressEnter, onKeyDown: onKeyDownProp, onFocus, onBlur, } = props;
    const controlled = value !== undefined;
    const boxRef = react_1.default.useRef(null);
    const textRef = react_1.default.useRef(null); // 文本内容行（intrinsic view），供点击落位取精确左沿
    const viewportRef = react_1.default.useRef(null); // 裁剪视口（overflow hidden），读 .w 得可视宽度算横向滚动
    const lastSeen = react_1.default.useRef(value); // 受控：上一次渲染时见到的 value prop，用于识别 value 是否真的变过
    const [, force] = react_1.default.useReducer((x) => x + 1, 0);
    const [focused, setFocused] = react_1.default.useState(false);
    const [blink, setBlink] = react_1.default.useState(true);
    const s = react_1.default.useRef({
        text: controlled ? value : defaultValue,
        caret: 0,
        anchor: 0,
        comp: null,
        prefixW: 0,
    }).current;
    // 几何（走 token，不写字面量）
    const height = size === 'large' ? token.controlHeightLG : size === 'small' ? token.controlHeightSM : token.controlHeight;
    const fs = token.fontSize;
    // 不显式设 fontFamily：走 painter 默认已注册字体（含 CJK），与其余组件一致；
    // 若强设 token.fontFamily（系统字体栈）会在 Skia 里缺字变豆腐块。
    const fontStyle = { fontSize: fs };
    // 光标默认停在末尾
    react_1.default.useEffect(() => {
        const n = Array.from(s.text).length;
        s.caret = n;
        s.anchor = n;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // 受控同步采用「本地镜像 + 回灌识别」（见渲染段）：原生按键回调在 React 批处理之外，
    // 并发根下 value 回灌滞后于下一次 keydown，若直读 value 会丢字/显示闪回旧值。
    // 闪烁：聚焦且非组合时 530ms 翻一次
    react_1.default.useEffect(() => {
        if (!focused || disabled)
            return;
        setBlink(true);
        const id = setInterval(() => setBlink((b) => !b), 530);
        return () => clearInterval(id);
    }, [focused, disabled]);
    const cps = (t) => Array.from(t);
    // 权威文本：s.text 本地镜像。受控时编辑先乐观写镜像再 emit；渲染期识别回灌（见渲染段）。
    const getText = () => s.text;
    const setText = (t) => {
        s.text = t; // 受控也写镜像：下一个按键读它，不等 React flush，杜绝连打丢字
    };
    const clampIdx = (i) => Math.max(0, Math.min(i, cps(getText()).length));
    const sel = () => {
        const a = s.anchor;
        const b = s.caret;
        return a <= b ? [a, b] : [b, a];
    };
    const emit = (next) => {
        onChange && onChange(next);
        force();
    };
    const insertText = (t) => {
        if (disabled || readOnly)
            return;
        s.comp = null;
        if (process.env.FLUX_KEYDEBUG)
            console.log('[insert]', JSON.stringify(t), 'caret=', s.caret, 'len=', getText().length); // 翻倍定位取证
        const arr = cps(getText());
        const [a, b] = sel();
        let ns = arr.slice(0, a).concat(cps(t), arr.slice(b));
        if (maxLength && maxLength > 0)
            ns = ns.slice(0, maxLength);
        const str = ns.join('');
        setText(str);
        const c = Math.min(a + cps(t).length, ns.length);
        s.caret = c;
        s.anchor = c;
        emit(str);
    };
    const deleteRange = (dir) => {
        if (disabled || readOnly)
            return;
        s.comp = null;
        const arr = cps(getText());
        let [a, b] = sel();
        if (a === b) {
            if (dir < 0)
                a = Math.max(0, a - 1);
            else
                b = Math.min(arr.length, b + 1);
        }
        const str = arr.slice(0, a).concat(arr.slice(b)).join('');
        setText(str);
        s.caret = a;
        s.anchor = a;
        emit(str);
    };
    const move = (dir, mods) => {
        const [a, b] = sel();
        let c;
        if (mods.ctrl) {
            c = dir < 0 ? 0 : cps(getText()).length; // 简化：Ctrl+方向 → Home/End
        }
        else if (!mods.shift && a !== b) {
            c = dir < 0 ? a : b; // 有选区先跳到边缘
        }
        else {
            c = s.caret + dir;
        }
        c = clampIdx(c);
        if (mods.shift)
            s.caret = c;
        else {
            s.caret = c;
            s.anchor = c;
        }
        force();
    };
    const onKeyDown = (key, mods) => {
        if (disabled)
            return false;
        // 外层逃生口：返回 true 则抢走该键（例：命令面板用 ↑↓ 导航候选项）
        if (onKeyDownProp && onKeyDownProp(key, mods) === true)
            return true;
        // 剪贴板/全选快捷键：Ctrl（Win/Linux）或 Meta（mac ⌘）+ a/c/x/v
        if ((mods.ctrl || mods.meta) && key.length === 1) {
            switch (key.toLowerCase()) {
                case 'a':
                    selectAll();
                    return true;
                case 'c':
                    copySelection();
                    return true;
                case 'x':
                    cutSelection();
                    return true;
                case 'v':
                    pasteClipboard();
                    return true;
                default:
                    break;
            }
        }
        switch (key) {
            case 'Backspace':
                deleteRange(-1);
                return true;
            case 'Delete':
                deleteRange(1);
                return true;
            case 'Enter':
                onPressEnter && onPressEnter(getText());
                return true;
            case 'Escape':
                (0, textinput_1.setActiveEditable)(null);
                return true;
            case 'ArrowLeft':
                move(-1, mods);
                return true;
            case 'ArrowRight':
                move(1, mods);
                return true;
            case 'Home':
                {
                    const c = mods.shift ? 0 : 0;
                    if (mods.shift)
                        s.caret = c;
                    else {
                        s.caret = 0;
                        s.anchor = 0;
                    }
                    force();
                }
                return true;
            case 'End':
                {
                    const c = cps(getText()).length;
                    if (mods.shift)
                        s.caret = c;
                    else {
                        s.caret = c;
                        s.anchor = c;
                    }
                    force();
                }
                return true;
            case 'ArrowUp':
            case 'ArrowDown':
                return true; // 单行输入吞掉上下键，避免冒泡
            default:
                return false;
        }
    };
    const setComposition = (text, caret) => {
        if (disabled || readOnly)
            return;
        if (!text) {
            s.comp = null;
        }
        else {
            s.comp = { text, caret: caret == null ? cps(text).length : caret };
        }
        force();
    };
    const placeCaret = (localX) => {
        if (disabled || readOnly)
            return;
        // localX 相对容器外沿；减去文本行相对容器的左偏移（含内边距/边框/前缀），得到文本起点内的 x
        const node = boxRef.current;
        const tr = textRef.current;
        const offset = node && tr ? tr.ax - node.ax : s.prefixW + token.paddingSM;
        const idx = (0, textLayout_1.caretIndexAtX)(getText(), fontStyle, Math.max(0, localX - offset));
        s.caret = idx;
        s.anchor = idx;
        force();
    };
    // 拖动选词：与 placeCaret 同坐标换算，但只动 caret、保留 anchor（mousedown 已定 anchor）。
    const selectTo = (localX) => {
        if (disabled || readOnly || s.comp != null)
            return; // 合成期拖选会让 preedit 显示错位，直接屏蔽
        const node = boxRef.current;
        const tr = textRef.current;
        const offset = node && tr ? tr.ax - node.ax : s.prefixW + token.paddingSM;
        s.caret = (0, textLayout_1.caretIndexAtX)(getText(), fontStyle, Math.max(0, localX - offset));
        force();
    };
    const focus = () => {
        if (disabled)
            return;
        setFocused(true);
        onFocus && onFocus();
    };
    const blur = () => {
        s.comp = null;
        // 不塌缩 anchor：保留选区供右键菜单项（复制/剪切）在 blur 后仍能从 sel() 读到。
        // 下次点击/落位（placeCaret）会显式 anchor=caret 收敛选区，正常输入（insertText/deleteRange）也各自重置。
        setFocused(false);
        onBlur && onBlur();
        force();
    };
    // ---- 剪贴板 / 全选 ----
    const selectAll = () => {
        if (disabled || readOnly)
            return;
        s.anchor = 0;
        s.caret = cps(getText()).length;
        force();
    };
    const copySelection = () => {
        const [a, b] = sel();
        if (a === b)
            return false;
        const text = cps(getText()).slice(a, b).join('');
        return (0, clipboard_1.writeClipboard)(text);
    };
    const cutSelection = () => {
        if (disabled || readOnly)
            return false;
        const [a, b] = sel();
        if (a === b)
            return false;
        const arr = cps(getText());
        (0, clipboard_1.writeClipboard)(arr.slice(a, b).join(''));
        const next = arr.slice(0, a).concat(arr.slice(b)).join('');
        setText(next);
        s.caret = a;
        s.anchor = a;
        emit(next);
        return true;
    };
    const pasteClipboard = () => {
        if (disabled || readOnly)
            return;
        const text = (0, clipboard_1.readClipboard)();
        if (process.env.FLUX_KEYDEBUG)
            console.log('[paste]', JSON.stringify(text)); // 翻倍定位取证
        if (!text)
            return;
        insertText(text);
    };
    // 组装右键菜单项（捕获本实例方法闭包；disabled 项置灰）；分组：剪切复制 | 粘贴 | 全选 | 清空
    const buildMenuItems = () => {
        const hasSel = sel()[0] !== sel()[1];
        const editable = !disabled && !readOnly;
        const nonEmpty = cps(getText()).length > 0;
        const items = [];
        if (editable)
            items.push({ label: '剪切', disabled: !hasSel, onClick: () => cutSelection() });
        items.push({ label: '复制', disabled: !hasSel, onClick: () => copySelection() });
        if (editable)
            items.push({ label: '粘贴', disabled: !(0, clipboard_1.readClipboard)(), divider: true, onClick: () => pasteClipboard() });
        items.push({ label: '全选', disabled: !nonEmpty, divider: true, onClick: () => selectAll() });
        if (editable)
            items.push({ label: '清空', disabled: !nonEmpty, divider: true, onClick: () => { if (nonEmpty) {
                    setText('');
                    s.caret = 0;
                    s.anchor = 0;
                    emit('');
                } } });
        return items;
    };
    const controller = react_1.default.useMemo(() => ({
        insertText,
        deleteBackward: () => deleteRange(-1),
        deleteForward: () => deleteRange(1),
        onKeyDown,
        setComposition,
        isComposing: () => s.comp != null,
        focus,
        blur,
        placeCaret,
        selectTo,
        showContextMenu: (x, y) => {
            (0, contextmenu_1.showContextMenu)(x, y, buildMenuItems());
        },
    }), 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled, readOnly, maxLength, controlled, value, onChange, onPressEnter, onKeyDownProp, onFocus, onBlur]);
    // 控制器每次渲染都保持最新（受控 value 变化会重建 controller），用 ref 承接：
    // 避免把 controller 放进挂载 effect 依赖里，否则每次按键都 cleanup→forgetEditable→丢焦点（受控 Input 打一个字就失焦的真凶）。
    const controllerRef = react_1.default.useRef(controller);
    controllerRef.current = controller;
    // 挂控制器到根场景节点；卸载时摘除并清除焦点引用。autoFocus 首次挂载即聚焦。
    // deps 不含 controller：焦点生命周期只随结构态（autoFocus/disabled/readOnly）变化，不随每次按键重建的控制器抖动。
    react_1.default.useEffect(() => {
        const node = boxRef.current;
        if (!node)
            return;
        if (disabled) {
            (0, textinput_1.forgetEditable)(node);
            return;
        }
        node.__input = controllerRef.current;
        if (autoFocus && !readOnly)
            (0, textinput_1.setActiveEditable)(node);
        return () => {
            (0, textinput_1.forgetEditable)(node);
            if (node.__input)
                node.__input = undefined;
        };
    }, [autoFocus, disabled, readOnly]);
    // 每帧把 __input 指向最新控制器（节点身份稳定，仅换实现），保证 activeController() 拿到的闭包不过期。
    react_1.default.useEffect(() => {
        const node = boxRef.current;
        if (node && node.__input)
            node.__input = controllerRef.current;
    });
    // ---- 渲染 ----
    const borderColor = disabled
        ? token.colorBorder
        : status === 'error'
            ? token.colorError
            : status === 'warning'
                ? token.colorWarning
                : focused
                    ? token.colorPrimary
                    : token.colorBorder;
    // 受控采纳：只认「value 相对上次渲染真的变了」为新权威（回灌/外部改写/父裁剪）；
    // 父尚未 flush 的中间渲染（value 仍是旧值）保留领先的本镜像，杜绝旧值覆盖新字/显示闪回。
    if (controlled) {
        const v = value ?? '';
        if (v !== lastSeen.current) {
            lastSeen.current = v;
            if (v !== s.text) {
                s.text = v;
                // 外部缩短文本时钳光标/选区，防越界索引让后续 sel() 系操作错位
                const n = cps(v).length;
                if (s.caret > n)
                    s.caret = n;
                if (s.anchor > n)
                    s.anchor = n;
            }
        }
    }
    const dispText = s.text;
    const caret = Math.max(0, Math.min(s.caret, cps(dispText).length));
    const beforeArr = cps(dispText).slice(0, caret).join('');
    const afterArr = cps(dispText).slice(caret).join('');
    const compText = s.comp ? s.comp.text : '';
    const compCaret = s.comp ? s.comp.caret : 0;
    // 组合文本插在光标处，其内部再放合成光标
    const before = beforeArr + cps(compText).slice(0, compCaret).join('');
    const after = cps(compText).slice(compCaret).join('') + afterArr;
    const empty = beforeArr.length === 0 && afterArr.length === 0 && !compText;
    const showCaret = focused && !disabled;
    const caretVisible = s.comp ? true : blink;
    const caretH = Math.round(fs * 1.3);
    // flexShrink:0 + 文本行显式 width（见下）：阻断 Yoga 默认 shrink=1 在超宽时压缩 Text，
    // 否则 Text 被 AT_MOST(压缩宽) 测量→换行折成多行（光标居中段时整行错位）。
    const tStyle = { fontSize: fs, color: token.colorText, flexShrink: 0 };
    const phStyle = { fontSize: fs, color: token.colorTextQuaternary };
    // prefix/suffix 对齐 antd：支持 ReactNode（图标等）。纯文本走 Text，元素走行内容器，
    // 避免把元素 String() 化成 [object Object]。
    const isPlain = (c) => typeof c === 'string' || typeof c === 'number';
    const prefixNode = prefix != null ? (isPlain(prefix) ? (react_1.default.createElement(components_1.Text, { key: "prefix", style: { fontSize: fs, color: token.colorTextQuaternary, marginRight: token.marginXXS } }, String(prefix))) : (react_1.default.createElement(components_1.View, { key: "prefix", style: { flexDirection: 'row', alignItems: 'center', marginRight: token.marginXXS } }, prefix))) : null;
    const showClear = allowClear && focused && !disabled && !readOnly && (beforeArr.length + afterArr.length > 0);
    // 前缀为字符串时按其近似宽度补偿点击落位偏移（供 placeCaret 换算）
    s.prefixW = typeof prefix === 'string' ? Math.round(prefix.length * fs * 0.6) + token.marginXXS : 0;
    // 横向滚动到光标：文本行按自然宽渲染，用 marginLeft 负偏移把光标推入可视区，外层 overflow 裁剪。
    // placeCaret 读 textRef.ax 已含此位移，落位自动对齐，无需另存 scrollX。
    const vpW = viewportRef.current ? viewportRef.current.w : 0;
    const caretPad = token.lineWidth + 2; // 仅供滚动留白，让光标不贴右沿（不参与文本布局）
    const beforeW = (0, textLayout_1.measureSingleLineWidth)(before, fontStyle);
    const totalW = beforeW + (0, textLayout_1.measureSingleLineWidth)(after, fontStyle); // 连续文本自然宽（光标不占位）
    let scrollX = 0;
    if (vpW > 0 && totalW > vpW) {
        const desired = beforeW + caretPad - (vpW - 4); // 光标尽量贴近右沿，留 4px 余量
        scrollX = Math.max(0, Math.min(desired, totalW - vpW));
        if (beforeW < scrollX)
            scrollX = Math.max(0, beforeW - 4); // 往回编辑：保证光标左侧也可见
    }
    // 选区高亮：聚焦、非 IME 组合、anchor≠caret 时，把文本切成 pre/mid/post 三段，mid 套背景色。
    const hasSel = focused && s.comp == null && s.anchor !== s.caret;
    const selArr = cps(dispText);
    const selStart = Math.min(s.anchor, s.caret);
    const selEnd = Math.max(s.anchor, s.caret);
    const selStyle = { ...tStyle, backgroundColor: token.colorPrimaryBg };
    // 光标：绝对定位覆盖层，不参与横向布局——文本作为单个连续节点渲染。
    // （旧做法把光标内联插在 before/after 两段之间，光标宽 + 拆分处的字距断裂会随光标移动在文本中形成移动台阶=瞤动。）
    // 水平落在 caretX（光标左侧文本的度量宽）；竖直 top/bottom 拉满行高再居中，与文本同一中线。
    const caretX = hasSel ? (0, textLayout_1.measureSingleLineWidth)(selArr.slice(0, s.caret).join(''), fontStyle) : beforeW;
    const caretOverlay = showCaret ? (react_1.default.createElement(components_1.View, { key: "c", style: { position: 'absolute', left: caretX, top: 0, bottom: 0, width: token.lineWidth, alignItems: 'center', justifyContent: 'center', flexShrink: 0 } },
        react_1.default.createElement(components_1.View, { style: { width: token.lineWidth, height: caretH, backgroundColor: token.colorText, opacity: caretVisible ? 1 : 0 } }))) : null;
    const inlineKids = [];
    if (hasSel) {
        const pre = selArr.slice(0, selStart).join('');
        const mid = selArr.slice(selStart, selEnd).join('');
        const post = selArr.slice(selEnd).join('');
        if (pre)
            inlineKids.push(react_1.default.createElement(components_1.Text, { key: "pre", preserveTrailingSpace: true, style: tStyle }, pre));
        inlineKids.push(react_1.default.createElement(components_1.Text, { key: "mid", preserveTrailingSpace: true, style: selStyle }, mid));
        if (post)
            inlineKids.push(react_1.default.createElement(components_1.Text, { key: "post", preserveTrailingSpace: true, style: tStyle }, post));
    }
    else {
        const full = before + after; // 连续单节点（含 IME 合成文本），拆分只会引入字距断裂
        if (full)
            inlineKids.push(react_1.default.createElement(components_1.Text, { key: "full", preserveTrailingSpace: true, style: tStyle }, full));
    }
    if (caretOverlay)
        inlineKids.push(caretOverlay);
    const content = react_1.default.createElement('view', { ref: viewportRef, key: 'content', style: { flex: 1, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' } }, empty && !focused ? (react_1.default.createElement(components_1.Text, { numberOfLines: 1, style: { ...phStyle, flex: 1 } }, placeholder)) : (react_1.default.createElement('view', { ref: textRef, style: { flexDirection: 'row', alignItems: 'center', marginLeft: -scrollX, width: totalW + 4, minHeight: caretH, flexShrink: 0 } }, inlineKids)));
    return react_1.default.createElement('view', {
        ref: boxRef,
        style: [
            {
                flexDirection: 'row',
                alignItems: 'center',
                height,
                paddingHorizontal: token.paddingSM,
                borderWidth: token.lineWidth,
                borderStyle: 'solid',
                borderColor,
                borderRadius: token.borderRadius,
                backgroundColor: disabled ? token.colorFillQuaternary : token.colorBgContainer,
                opacity: disabled ? 0.6 : 1,
                overflow: 'hidden',
                cursor: disabled ? 'not-allowed' : readOnly ? 'default' : 'text',
            },
            style,
        ],
    }, [
        prefixNode,
        content,
        showClear ? (react_1.default.createElement(components_1.Pressable, { key: "clear", onPress: () => {
                setText(''); // 无条件写镜像（与 insertText / 右键“清空” / TextArea 一致）：受控时否则父回灌前镜像仍为旧值，紧接着打字会拼到旧值上
                s.caret = 0;
                s.anchor = 0;
                s.comp = null;
                emit('');
            } },
            react_1.default.createElement(components_1.Text, { style: { fontSize: fs, color: token.colorTextQuaternary, marginLeft: token.marginXXS } }, "\u2715"))) : null,
        suffix != null ? (isPlain(suffix) ? (react_1.default.createElement(components_1.Text, { key: "suffix", style: { fontSize: fs, color: token.colorTextSecondary, marginLeft: token.marginXXS } }, String(suffix))) : (react_1.default.createElement(components_1.View, { key: "suffix", style: { flexDirection: 'row', alignItems: 'center', marginLeft: token.marginXXS } }, suffix))) : null,
    ]);
}
exports.default = Input;
