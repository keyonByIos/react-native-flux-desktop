/** 命名键的修饰键状态 */
export interface KeyMods {
    shift?: boolean;
    ctrl?: boolean;
    alt?: boolean;
    meta?: boolean;
}
/**
 * 聚焦字段的命令式编辑接口。所有方法都由 host 在收到原生事件时同步调用，
 * 具体实现（TextInput）内部用 React 状态 + ref 落地，重排重绘交由 commit 触发下一帧。
 */
export interface EditableController {
    /** 插入文本：键盘可见字符与 IME commit 都走这里（含选区替换） */
    insertText(text: string): void;
    /** 向左删除一个字符（含选区优先整体删除） */
    deleteBackward(): void;
    /** 向右删除一个字符 */
    deleteForward(): void;
    /**
     * 命名键处理：Enter / Tab / Escape / ArrowLeft / ArrowRight / Home / End / Backspace / Delete …
     * 返回 true 表示已被字段消费（host 不再做默认动作）。
     */
    onKeyDown(key: string, mods: KeyMods): boolean;
    /** IME 组合中（preedit）：text 为空串表示结束当前组合 */
    setComposition(text: string, caret?: number): void;
    /** 当前是否处于 IME 组合中；host 据此在合成期间忽略原始按键的直接插入，避免拼音字母漏入 */
    isComposing(): boolean;
    /** 焦点进入本字段 */
    focus(): void;
    /** 焦点离开本字段（提交组合、失焦样式） */
    blur(): void;
    /** 点击落位：x/y 为相对本字段内容盒左/上沿的逻辑像素，把光标放到最近的字符边界（单行忽略 y） */
    placeCaret(x: number, y?: number): void;
    /**
     * 拖动选词：mousedown 已定 anchor，拖动中只把 caret 移到落点边界（x/y 同 placeCaret 口径）。
     * 可选：仅支持选区的字段提供。
     */
    selectTo?(x: number, y?: number): void;
    /**
     * 右键命中该字段时弹出上下文菜单（复制/粘贴/全选等）。
     * x/y 为窗口逻辑坐标，供浮层定位。可选：仅实现了剪贴板的字段提供。
     */
    showContextMenu?(x: number, y: number): void;
}
