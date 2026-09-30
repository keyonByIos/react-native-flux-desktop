
export interface KeyMods {
    shift?: boolean;
    ctrl?: boolean;
    alt?: boolean;
    meta?: boolean;
}

export interface EditableController {

    insertText(text: string): void;

    deleteBackward(): void;

    deleteForward(): void;

    onKeyDown(key: string, mods: KeyMods): boolean;

    setComposition(text: string, caret?: number): void;

    isComposing(): boolean;

    focus(): void;

    blur(): void;

    placeCaret(x: number, y?: number): void;

    selectTo?(x: number, y?: number): void;

    showContextMenu?(x: number, y: number): void;
}
