import type { AliasToken, ComponentTokenMap } from './interface';
type AnyComponents = Partial<{
    [K in keyof ComponentTokenMap]?: {
        token?: Partial<ComponentTokenMap[K]['token']>;
    };
}>;

export declare function buildComponentTokens(alias: AliasToken, userComponents?: AnyComponents): ComponentTokenMap;
export {};
