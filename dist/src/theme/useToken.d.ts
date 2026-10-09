import type { AliasToken, ComponentName, ComponentTokenMap } from './interface';
export interface UseTokenResult {
    token: AliasToken;
    components: ComponentTokenMap;
    hashId: string;
    /** Get a single component's merged token. */
    getComponentToken: <K extends ComponentName>(name: K) => ComponentTokenMap[K]['token'];
}
/** Access the resolved theme tokens from the nearest <FluxProvider />. */
export declare function useToken(): UseTokenResult;
