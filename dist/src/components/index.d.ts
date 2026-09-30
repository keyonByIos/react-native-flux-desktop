import React from 'react';
import { BaseProps, ImageSource, PressableProps, StyleProp, TextStyle, ViewStyle } from '../types';
export interface ViewProps extends BaseProps {
    onTouchStart?: (e: any) => void;
    /** 'none'：本节点及其子树不参与命中测试（高亮/浮层盖在正文上但点击穿透） */
    pointerEvents?: 'auto' | 'none';
    /** in-app 拖拽源标记（由 useDrag 注入，值 = { id }；host 上溯读取，处理器在 window/drag 注册表） */
    __drag?: {
        id: number;
    };
    /** in-app 放置目标标记（由 useDrop 注入，值 = { id }） */
    __drop?: {
        id: number;
    };
}
export declare const View: React.ForwardRefExoticComponent<ViewProps & React.RefAttributes<any>>;
export interface TextProps extends BaseProps {
    style?: StyleProp<TextStyle>;
    numberOfLines?: number;
    onPress?: () => void;
    /** 绕盒子中心旋转（度），只影响绘制不改布局 */
    rotate?: number;
    /** 保留行尾空白（单行输入框用）：否则尾部空格被当行尾空白裁掉，零宽不绘制 */
    preserveTrailingSpace?: boolean;
    /** 长按选中→复制（默认 false：静态文本不可选，需显式开启） */
    selectable?: boolean;
}
export declare function Text(props: TextProps): React.ReactElement;
export interface ImageProps extends BaseProps {
    source?: ImageSource | string;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
}
export declare function Image(props: ImageProps): React.ReactElement;
export interface VideoProps extends BaseProps {
    /** 帧槽 id：与解码器（src/io/video/frames）一致，painter 据此从注册表取当前帧 */
    videoId?: number;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
}
export declare function Video(props: VideoProps): React.ReactElement;
/** 按压状态，与 RN Pressable 的 render-prop 子集一致 */
export interface PressableState {
    pressed: boolean;
}
export interface PressablePropsEx extends Omit<PressableProps, 'style' | 'children'> {
    style?: StyleProp<ViewStyle> | ((state: PressableState) => StyleProp<ViewStyle>);
    children?: React.ReactNode | ((state: PressableState) => React.ReactNode);
}
export declare function Pressable(props: PressablePropsEx): React.ReactElement;
export interface ScrollViewProps extends BaseProps {
    horizontal?: boolean;
    contentContainerStyle?: StyleProp<ViewStyle>;
    showsVerticalScrollIndicator?: boolean;
    /** 滚动偏移上报（host 滚轮处理后回调） */
    onScroll?: (e: {
        nativeEvent: {
            contentOffset: {
                x: number;
                y: number;
            };
            contentSize: {
                width: number;
                height: number;
            };
        };
    }) => void;
    /** 受控纵向偏移（px）：传入后每帧同步，可用于 BackTop 回顶 */
    scrollY?: number;
    /** 受控横向偏移（px），配合 horizontal */
    scrollX?: number;
}
export declare function ScrollView(props: ScrollViewProps): React.ReactElement;
export interface WindowProps extends BaseProps {
    title?: string;
    width?: number;
    height?: number;
    /** 可选逻辑坐标（左上角）。缺省时窗口在主显示器居中（主窗/对话框常见期望）；子窗/级联窗传此值错位 */
    x?: number;
    y?: number;
    /** 归属父窗 id（App 开窗时注入）；里程碑 1 仅作登记元数据，原生父窗绑定后续接 */
    parentId?: number;
    /** 模态窗：入 App 模态栈，存在活动模态窗时其它窗输入被吞 */
    modal?: boolean;
    /** 顶层窗：置前且不被普通窗遮挡。缺省 = 跟随 modal（模态窗默认置顶） */
    alwaysOnTop?: boolean;
    /** 业务标签：供 App.findByTag/closeTag 定位此窗（如 'settings'） */
    tag?: string;
    /** 是否允许用户拖拽缩放窗口（缺省 true）。false → 边框拖拽/最大化按钮失效 */
    resizable?: boolean;
    /** 最小内尺寸（逻辑像素，任一维可单独给）：拖小到此尺寸即被限制 */
    minWidth?: number;
    minHeight?: number;
    /** 最大内尺寸（逻辑像素，任一维可单独给）：拖大到此尺寸即被限制 */
    maxWidth?: number;
    maxHeight?: number;
    /** 是否有系统标题栏/边框（缺省 true）。false = 无标题无边框（自绘顶栏/异形窗） */
    decorations?: boolean;
    /** 无背景/透明能力窗（缺省 false）。当前软栅格无 alpha 桌面穿透，未绘制区暂黑 */
    transparent?: boolean;
    /** 建窗即最大化（缺省 false） */
    maximized?: boolean;
    /** 在主显示器居中。缺省：未显式给 x/y 时自动为 true；显式传 false 可退回 OS 默认摆放 */
    center?: boolean;
    /** 生命周期·准备加载：窗口即将创建（建窗句柄前）触发一次 */
    onPreparing?: () => void;
    /** 生命周期·加载中：原生窗口已建、内容首帧尚未上屏时触发一次 */
    onLoading?: () => void;
    /** 生命周期·加载完成：首帧成功贴屏后触发一次 */
    onReady?: () => void;
    /** 生命周期·关闭：窗口销毁/关闭时触发一次 */
    onClose?: () => void;
    /** 焦点变化：获焦 true / 失焦 false。供无框弹窗（如托盘菜单）「失焦即关」 */
    onFocused?: (focused: boolean) => void;
}
export declare function Window(props: WindowProps): React.ReactElement;
