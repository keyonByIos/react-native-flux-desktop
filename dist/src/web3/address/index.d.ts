import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface AddressProps {
    /** 完整地址（0x…）；截断与二维码均取此值 */
    address: string;
    /** 展示名（如 ENS），给了就替代截断地址 */
    name?: string;
    /** 链名标签，如 Ethereum / BSC；配 chainColor 上一枚 Tag */
    chain?: string;
    chainColor?: string;
    /** 截断：true 默认头 6 尾 4；或自定义 {lead,trail}；false 显示完整 */
    truncated?: boolean | {
        lead?: number;
        trail?: number;
    };
    /** 前缀头像：默认 Web3Avatar，传 false 关闭 */
    prefix?: React.ReactNode | false;
    copyable?: boolean;
    /** 是否展示二维码切换图标 */
    scanCode?: boolean;
    /** 是否展示浏览器外链图标（仅图示） */
    openInExplorer?: boolean;
    size?: 'small' | 'middle' | 'large';
    style?: StyleProp<ViewStyle>;
}
export declare function Address(props: AddressProps): React.ReactElement;
export default Address;
