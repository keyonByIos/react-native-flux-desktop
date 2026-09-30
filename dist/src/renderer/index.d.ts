import React from 'react';
export type RendererOptions = {
    /** 首次 commit 完成后回调（此时窗口已建，但帧可能尚未绘制） */
    onRender?: () => void;
};
export declare function render(element: React.ReactNode, options?: RendererOptions): Promise<void>;
/** 调试辅助：把所有窗口的当前帧抓成 PNG，用于像素级验证。
 * 统一输出目录 + 名称区分：设 FLUX_GRAB_NAME=<名称> 时写成 <dir>/<名称>.png（多窗口追加 -1/-2…）；
 * 未设则退回旧的 <dir>/window-<i>.png。 */
export declare function grabAll(dir: string): void;
