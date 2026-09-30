import React from 'react';
import { type InputProps } from '../input';
export interface SearchProps extends Omit<InputProps, 'prefix'> {
    /** 回车 / 点搜索图标 / 点 enterButton 触发 */
    onSearch?: (v: string) => void;
    /** 搜索中：前缀图标换成旋转 loading，enterButton 态按钮转圈并拦截点击 */
    loading?: boolean;
    /** 附着搜索按钮：true 图标按钮；传节点/文字则 primary 文字按钮（右侧圆角贴合） */
    enterButton?: boolean | React.ReactNode;
}
export declare function Search(props: SearchProps): React.ReactElement;
export default Search;
