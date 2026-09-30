"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextArea = TextArea;
// TEXTAREA：多行文本域。复用 Input 打好的「原生键→host→EditableController」链路：
// 本组件把控制器挂到根节点 __input，host 命中后路由键盘/IME/落位/拖选/右键菜单，无需 React ref 穿透。
// 与 Input 的关键差异在渲染模型：单行是「一行 + 横向滚动」，多行是「wrapText 软换行成 N 可视行 + 纵向滚动」，
// 光标是二维的（绝对码点位 ↔ (可视行, 行内偏移) 双向映射）。Enter 换行（antd 默认）；上下键按可视行移动并保留首选列。
// 受控/非受控沿用「本地镜像 + 回灌识别」（见渲染段），杜绝并发 flush 滞后导致的连打丢字。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const textLayout_1 = require("../../paint/textLayout");
const clipboard_1 = require("../../window/clipboard");
const contextmenu_1 = require("../../window/contextmenu");
const textinput_1 = require("../../events/textinput");
function TextArea(props) {
    const { token } = (0, theme_1.useToken)();
    const { value, defaultValue = '', placeholder = '', disabled, readOnly, autoFocus, rows, maxLength, autoSize, showCount, allowClear, status, style, onChange, onFocus, onBlur, } = props;
    const controlled = value !== undefined;
    const boxRef = react_1.default.useRef(null); // 根场景节点（host 命中取 __input；也供落位坐标原点）
    const columnRef = react_1.default.useRef(null); // 内容列（含 -scrollY 位移），供落位取精确左/上沿
    const viewportRef = react_1.default.useRef(null); // 裁剪视口，读 .w 得换行宽、读 .h 得可视高
    const lastSeen = react_1.default.useRef(value); // 受控：上一次渲染见到的 value，用于识别外部改写
    const scrollY = react_1.default.useRef(0); // 纵向滚动偏移（内容坐标）
    const prefX = react_1.default.useRef(0); // 上下键跨行时保留的首选列宽
    const geo = react_1.default.useRef({ availW: 0, lineH: 0 }).current; // 每帧渲染回填，供事件回调（渲染外）复算换行
    const [, force] = react_1.default.useReducer((x) => x + 1, 0);
    const [focused, setFocused] = react_1.default.useState(false);
    const [blink, setBlink] = react_1.default.useState(true);
    const s = react_1.default.useRef({
        text: controlled ? value : defaultValue,
        caret: 0,
        anchor: 0,
        comp: null,
    }).current;
    // 几何（走 token）
    const fs = token.fontSize;
    const fontStyle = { fontSize: fs };
    const lineH = (0, textLayout_1.lineHeightOf)(fontStyle);
    const padV = token.paddingSM;
    const padH = token.paddingSM;
    const bd = token.lineWidth;
    geo.lineH = lineH;
    const cps = (t) => Array.from(t);
    const getText = () => s.text;
    const setText = (t) => {
        s.text = t; // 受控也写镜像：下一按键读它，不等 React flush
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
    // ---- 换行布局（事件回调内按提交文本复算；渲染内按 liveText 复算，见下）----
    const layoutNow = () => (0, textLayout_1.wrapText)(getText(), fontStyle, geo.availW || Infinity);
    const lineIndexOf = (idx, lines) => {
        for (let i = 0; i < lines.length; i++)
            if (idx <= lines[i].end)
                return i;
        return lines.length - 1;
    };
    const xOfCaret = (idx, lines) => {
        const li = lineIndexOf(idx, lines);
        const l = lines[li];
        return (0, textLayout_1.measureSingleLineWidth)(cps(l.text).slice(0, idx - l.start).join(''), fontStyle);
    };
    // 把光标行滚进可视区（autoSize 时视口≈内容高，通常不触发）
    const ensureVisible = (idx) => {
        const lines = layoutNow();
        const li = lineIndexOf(idx, lines);
        const vh = viewportRef.current ? viewportRef.current.h : 0;
        if (vh <= 0)
            return;
        const top = li * lineH;
        if (top < scrollY.current)
            scrollY.current = top;
        else if (top + lineH > scrollY.current + vh)
            scrollY.current = top + lineH - vh;
        if (scrollY.current < 0)
            scrollY.current = 0;
    };
    const insertText = (t) => {
        if (disabled || readOnly)
            return;
        s.comp = null;
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
        const lines = layoutNow();
        prefX.current = xOfCaret(c, lines);
        ensureVisible(c);
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
        const lines = layoutNow();
        prefX.current = xOfCaret(a, lines);
        ensureVisible(a);
        emit(str);
    };
    // 水平移动：按码点位 ±1（天然跨越软换行/硬换行边界）；Ctrl 跳到全文首/尾
    const moveH = (dir, mods) => {
        const [a, b] = sel();
        let c;
        if (mods.ctrl || mods.meta)
            c = dir < 0 ? 0 : cps(getText()).length;
        else if (!mods.shift && a !== b)
            c = dir < 0 ? a : b;
        else
            c = s.caret + dir;
        c = clampIdx(c);
        s.caret = c;
        if (!mods.shift)
            s.anchor = c;
        const lines = layoutNow();
        prefX.current = xOfCaret(c, lines);
        ensureVisible(c);
        force();
    };
    // 垂直移动：按可视行 ±1，用首选列在新行取最近落点
    const moveV = (dir, mods) => {
        const lines = layoutNow();
        const li = lineIndexOf(s.caret, lines);
        const ti = Math.max(0, Math.min(li + dir, lines.length - 1));
        const target = lines[ti];
        const local = (0, textLayout_1.caretIndexAtX)(target.text, fontStyle, prefX.current);
        const c = target.start + local;
        s.caret = c;
        if (!mods.shift)
            s.anchor = c;
        ensureVisible(c);
        force();
    };
    // 行首/行尾（Home/End）：落在当前可视行的起止
    const moveToEdge = (endOfLine, mods) => {
        const lines = layoutNow();
        const l = lines[lineIndexOf(s.caret, lines)];
        const c = endOfLine ? l.end : l.start;
        s.caret = c;
        if (!mods.shift)
            s.anchor = c;
        prefX.current = xOfCaret(c, lines);
        ensureVisible(c);
        force();
    };
    const onKeyDown = (key, mods) => {
        if (disabled)
            return false;
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
            case 'Tab':
                // antd TextArea：Enter 直接换行（Shift+Enter 同样换行——普通 Enter 无提交语义）
                insertText('\n');
                return true;
            case 'Escape':
                (0, textinput_1.setActiveEditable)(null);
                return true;
            case 'ArrowLeft':
                moveH(-1, mods);
                return true;
            case 'ArrowRight':
                moveH(1, mods);
                return true;
            case 'ArrowUp':
                moveV(-1, mods);
                return true;
            case 'ArrowDown':
                moveV(1, mods);
                return true;
            case 'Home':
                moveToEdge(false, mods);
                return true;
            case 'End':
                moveToEdge(true, mods);
                return true;
            default:
                return false;
        }
    };
    const setComposition = (text, caret) => {
        if (disabled || readOnly)
            return;
        if (!text)
            s.comp = null;
        else
            s.comp = { text, caret: caret == null ? cps(text).length : caret };
        force();
    };
    // 落位：x/y 为相对盒左/上沿；换算到内容列坐标（含 -scrollY），先按 y 选行、再按 x 选列
    const caretAtPoint = (localX, localY) => {
        const box = boxRef.current;
        const col = columnRef.current;
        const ox = col && box ? col.ax - box.ax : padH + bd;
        const oy = col && box ? col.ay - box.ay : padV + bd;
        const cx = Math.max(0, localX - ox);
        const cy = Math.max(0, localY - oy);
        const lines = layoutNow();
        const li = Math.max(0, Math.min(Math.floor(cy / (lineH || 1)), lines.length - 1));
        const l = lines[li];
        return l.start + (0, textLayout_1.caretIndexAtX)(l.text, fontStyle, cx);
    };
    const placeCaret = (localX, localY) => {
        if (disabled || readOnly)
            return;
        const idx = caretAtPoint(localX, localY ?? 0);
        s.caret = idx;
        s.anchor = idx;
        prefX.current = xOfCaret(idx, layoutNow());
        force();
    };
    const selectTo = (localX, localY) => {
        if (disabled || readOnly || s.comp != null)
            return;
        s.caret = caretAtPoint(localX, localY ?? 0);
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
        // 不塌缩 anchor：保留选区供右键菜单项在 blur 后仍能从 sel() 读到
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
        return (0, clipboard_1.writeClipboard)(cps(getText()).slice(a, b).join(''));
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
        if (!text)
            return;
        insertText(text);
    };
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
                    scrollY.current = 0;
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
        showContextMenu: (x, y) => (0, contextmenu_1.showContextMenu)(x, y, buildMenuItems()),
    }), 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled, readOnly, maxLength, controlled, value, onChange, onFocus, onBlur]);
    // 控制器每次渲染保持最新（受控 value 变化会重建 controller），用 ref 承接：
    // 避免把 controller 放进挂载 effect 依赖，否则每次按键 cleanup→forgetEditable→丢焦点（受控 TextArea 打一个字就失焦）。
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
    // 挂载后补跑一帧：拿到真实视口宽后按宽度重排（首帧 ref 未就绪时按 Infinity 未换行）
    react_1.default.useEffect(() => {
        const id = setTimeout(() => force(), 0);
        return () => clearTimeout(id);
    }, []);
    // 闪烁：聚焦且非组合时 530ms 翻一次
    react_1.default.useEffect(() => {
        if (!focused || disabled)
            return;
        setBlink(true);
        const id = setInterval(() => setBlink((b) => !b), 530);
        return () => clearInterval(id);
    }, [focused, disabled]);
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
    // 受控采纳：value 相对上次渲染真的变了才作新权威；外部缩短文本时钳光标/选区
    if (controlled) {
        const v = value ?? '';
        if (v !== lastSeen.current) {
            lastSeen.current = v;
            if (v !== s.text) {
                s.text = v;
                const n = cps(v).length;
                if (s.caret > n)
                    s.caret = n;
                if (s.anchor > n)
                    s.anchor = n;
            }
        }
    }
    const dispText = s.text;
    const caretClamped = Math.max(0, Math.min(s.caret, cps(dispText).length));
    // liveText：把 IME 组合文本按合成光标位插进提交文本，得到与显示一致的整串；dispCaret 为其码点位。
    // 组合串拆两段（合成光标前/后）分别接在 caretClamped 前后，保证 live 与 dispCaret 自洽。
    const compText = s.comp ? s.comp.text : '';
    const compCaret = s.comp ? s.comp.caret : 0;
    const live = cps(dispText).slice(0, caretClamped).join('') +
        cps(compText).slice(0, compCaret).join('') +
        cps(compText).slice(compCaret).join('') +
        cps(dispText).slice(caretClamped).join('');
    const dispCaret = caretClamped + compCaret;
    // 视口宽（换行约束）；首帧未就绪用 Infinity，下一帧 setTimeout(force) 修正
    const vpW = viewportRef.current ? viewportRef.current.w : 0;
    const availW = vpW > 0 ? vpW : Infinity;
    geo.availW = vpW;
    const lines = (0, textLayout_1.wrapText)(live, fontStyle, availW);
    // 盒高：autoSize 随内容行数（钳 min/max）；否则固定 rows（默认 3）
    let boxH;
    if (autoSize) {
        const minR = autoSize === true ? 1 : autoSize.minRows ?? 1;
        const maxR = autoSize === true ? Infinity : autoSize.maxRows ?? Infinity;
        const want = Math.max(minR, Math.min(lines.length || 1, maxR));
        boxH = want * lineH + padV * 2 + bd * 2;
        scrollY.current = 0; // autoSize 全展开，不滚动
    }
    else {
        boxH = (rows ?? 3) * lineH + padV * 2 + bd * 2;
    }
    const empty = cps(dispText).length === 0 && !compText;
    const showCaret = focused && !disabled;
    const caretVisible = s.comp ? true : blink;
    const caretH = Math.round(fs * 1.3);
    const hasSel = focused && s.comp == null && s.anchor !== s.caret;
    const selStart = Math.min(s.anchor, s.caret);
    const selEnd = Math.max(s.anchor, s.caret);
    const caretLineIdx = lineIndexOf(dispCaret, lines);
    const textStyle = { fontSize: fs, color: token.colorText, flexShrink: 0 };
    const selStyle = { ...textStyle, backgroundColor: token.colorPrimaryBg };
    const renderLine = (l, li) => {
        const chars = cps(l.text);
        const caretHere = showCaret && li === caretLineIdx;
        const caretLocal = caretHere ? Math.max(0, Math.min(dispCaret - l.start, chars.length)) : -1;
        const key = (i) => `${li}-${i}`;
        const kids = [];
        if (hasSel) {
            const a = Math.max(0, selStart - l.start);
            const b = Math.min(chars.length, selEnd - l.start);
            if (a >= b) {
                // 本行不在选区内
                if (chars.length)
                    kids.push(react_1.default.createElement(components_1.Text, { key: key(0), preserveTrailingSpace: true, style: textStyle }, l.text));
            }
            else {
                const pre = chars.slice(0, a).join('');
                const mid = chars.slice(a, b).join('');
                const post = chars.slice(b).join('');
                if (pre)
                    kids.push(react_1.default.createElement(components_1.Text, { key: key(1), preserveTrailingSpace: true, style: textStyle }, pre));
                if (mid)
                    kids.push(react_1.default.createElement(components_1.Text, { key: key(2), preserveTrailingSpace: true, style: selStyle }, mid));
                if (post)
                    kids.push(react_1.default.createElement(components_1.Text, { key: key(3), preserveTrailingSpace: true, style: textStyle }, post));
            }
        }
        else if (chars.length) {
            kids.push(react_1.default.createElement(components_1.Text, { key: key(6), preserveTrailingSpace: true, style: textStyle }, l.text));
        }
        // 光标：绝对覆盖层，不占横向布局——本行文本作为连续节点渲染，移动光标只改 caretX，不挤压后续文本。
        // 行高 lineH 确定，top/bottom 拉满行高再居中，与文本同一中线。
        if (caretHere) {
            const caretX = (0, textLayout_1.measureSingleLineWidth)(chars.slice(0, caretLocal).join(''), fontStyle);
            kids.push(react_1.default.createElement(components_1.View, { key: "c", style: { position: 'absolute', left: caretX, top: 0, bottom: 0, width: token.lineWidth, alignItems: 'center', justifyContent: 'center', flexShrink: 0 } },
                react_1.default.createElement(components_1.View, { style: { width: token.lineWidth, height: caretH, backgroundColor: token.colorText, opacity: caretVisible ? 1 : 0 } })));
        }
        return (react_1.default.createElement(components_1.View, { key: `line-${li}`, style: { position: 'relative', flexDirection: 'row', alignItems: 'center', height: lineH, width: '100%', flexShrink: 0 } }, kids));
    };
    const clearVisible = allowClear && focused && !disabled && !readOnly && cps(dispText).length > 0;
    const count = cps(dispText).length;
    const content = react_1.default.createElement('view', { ref: viewportRef, key: 'content', style: { flex: 1, overflow: 'hidden' } }, empty && !focused ? (react_1.default.createElement(components_1.Text, { key: "ph", style: { fontSize: fs, color: token.colorTextQuaternary } }, placeholder)) : (react_1.default.createElement('view', { key: 'col', ref: columnRef, style: { marginTop: -scrollY.current, width: '100%' } }, lines.map((l, li) => renderLine(l, li)))));
    return react_1.default.createElement('view', {
        ref: boxRef,
        style: [
            {
                flexDirection: 'column',
                justifyContent: 'flex-start',
                height: boxH,
                paddingHorizontal: padH,
                paddingVertical: padV,
                borderWidth: bd,
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
        content,
        clearVisible ? (react_1.default.createElement(components_1.Pressable, { key: "clear", onPress: () => {
                setText('');
                s.caret = 0;
                s.anchor = 0;
                s.comp = null;
                scrollY.current = 0;
                emit('');
            } },
            react_1.default.createElement(components_1.Text, { style: { position: 'absolute', right: padH, top: padV, fontSize: fs, color: token.colorTextQuaternary } }, "\u2715"))) : null,
        showCount ? (react_1.default.createElement(components_1.Text, { key: "count", style: {
                position: 'absolute',
                right: padH,
                bottom: padV,
                fontSize: token.fontSizeSM,
                color: maxLength && count > maxLength ? token.colorError : token.colorTextTertiary,
            } }, maxLength != null ? `${count} / ${maxLength}` : `${count}`)) : null,
    ]);
}
exports.default = TextArea;
