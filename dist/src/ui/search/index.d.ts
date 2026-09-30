import React from 'react';
import { type InputProps } from '../input';
export interface SearchProps extends Omit<InputProps, 'prefix'> {

    onSearch?: (v: string) => void;

    loading?: boolean;

    enterButton?: boolean | React.ReactNode;
}
export declare function Search(props: SearchProps): React.ReactElement;
export default Search;
