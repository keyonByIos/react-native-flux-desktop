import React from 'react';
export type RendererOptions = {

    onRender?: () => void;
};
export declare function render(element: React.ReactNode, options?: RendererOptions): Promise<void>;

export declare function grabAll(dir: string): void;
