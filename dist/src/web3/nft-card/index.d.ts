import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type TokenMeta } from '../token-price';
export interface NFTCardProps {
    /** 藏品名 */
    name: string;
    /** 所属系列 */
    collection?: string;
    /** 代币标准，如 ERC-721 / ERC-1155 → 右上 Tag */
    standard?: string;
    /** 合约地址 → Address（截断/复制/二维码） */
    contract?: string;
    /** 编号 */
    tokenId?: string | number;
    /** 封面：图片 URL 或自定义节点 */
    image?: string | React.ReactNode;
    /** 封面高度（px）。默认 200（image 为 URL 时生效） */
    coverHeight?: number;
    /** 价格 */
    price?: {
        token: TokenMeta | string;
        amount: number;
        fiatPrice?: number;
    };
    /** 价格标签文案。默认「当前价格」 */
    priceLabel?: string;
    /** 链名（合约 Address 的 Tag） */
    chain?: string;
    style?: StyleProp<ViewStyle>;
}
export declare function NFTCard(props: NFTCardProps): React.ReactElement;
export default NFTCard;
