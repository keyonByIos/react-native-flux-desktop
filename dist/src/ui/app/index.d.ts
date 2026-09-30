import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type MessageApi, type MessageOptions } from '../message';
import { type ModalApi } from '../modal';
import { type NotificationApi, type NotificationOptions } from '../notification';

export interface ModalOptions {
}

export interface AppContextValue {
    message: MessageApi;
    modal: ModalApi;
    notification: NotificationApi;
}

export declare function useApp(): AppContextValue;
export interface AppProps {

    message?: MessageOptions;

    notification?: NotificationOptions;

    modal?: ModalOptions;

    className?: string;
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
}
declare function AppInner(props: AppProps): React.ReactElement;

export declare const App: typeof AppInner & {
    useApp: typeof useApp;
};
export default App;
