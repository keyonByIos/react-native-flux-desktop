import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type MessageApi, type MessageOptions } from '../message';
import { type ModalApi } from '../modal';
import { type NotificationApi, type NotificationOptions } from '../notification';
/** 全局 modal 默认（预留：antd ModalConfig 主要含 icon / confirmPrefixCls，暂留空壳） */
export interface ModalOptions {
}
/** App.useApp() 返回的聚合句柄 */
export interface AppContextValue {
    message: MessageApi;
    modal: ModalApi;
    notification: NotificationApi;
}
/** 读取最近 <App> 提供的 message/modal/notification 句柄；必须在 <App> 内调用。 */
export declare function useApp(): AppContextValue;
export interface AppProps {
    /** message holder 的全局默认（duration / top / maxCount） */
    message?: MessageOptions;
    /** notification holder 的全局默认（placement / duration / top / bottom / maxCount） */
    notification?: NotificationOptions;
    /** modal 的全局默认（预留） */
    modal?: ModalOptions;
    /** 兼容 antd：外层类名（自绘栈忽略） */
    className?: string;
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
}
declare function AppInner(props: AppProps): React.ReactElement;
/** antd 风格 <App> 组件 + App.useApp() 静态方法。 */
export declare const App: typeof AppInner & {
    useApp: typeof useApp;
};
export default App;
