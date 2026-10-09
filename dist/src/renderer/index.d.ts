import React from 'react';
export type RendererOptions = {
    /** 首次 commit 完成后回调（此时窗口已建，但帧可能尚未绘制） */
    onRender?: () => void;
};
export declare function render(element: React.ReactNode, options?: RendererOptions): Promise<void>;
/** 向「首次 render 的主窗根」重新提交一棵元素树（复用同一 WindowHost，窗口不关）。
 *  通用重渲染能力：外壳元素类型在两次调用间保持稳定时其 fiber 不 remount，仅换类型的子树 remount。
 *  典型用途：开发期热更新（由外部 dev 工具驱动，app 源码无需配合）。未 render 过时返回 false。 */
export declare function hotReload(element: React.ReactNode): boolean;
/** 调试辅助：把所有窗口的当前帧抓成 PNG，用于像素级验证。
 * 统一输出目录 + 名称区分：设 FLUX_GRAB_NAME=<名称> 时写成 <dir>/<名称>.png（多窗口追加 -1/-2…）；
 * 未设则退回旧的 <dir>/window-<i>.png。 */
export declare function grabAll(dir: string): void;
