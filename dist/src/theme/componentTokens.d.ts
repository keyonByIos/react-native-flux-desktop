import type { AliasToken, ComponentTokenMap } from './interface';
type AnyComponents = Partial<{
    [K in keyof ComponentTokenMap]?: {
        token?: Partial<ComponentTokenMap[K]['token']>;
    };
}>;
/** Default component tokens derived from the current AliasToken. */
export declare function buildComponentTokens(alias: AliasToken, userComponents?: AnyComponents): ComponentTokenMap;
export {};
