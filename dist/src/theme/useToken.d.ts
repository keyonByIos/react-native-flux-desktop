import type { AliasToken, ComponentName, ComponentTokenMap } from './interface';
export interface UseTokenResult {
    token: AliasToken;
    components: ComponentTokenMap;
    hashId: string;

    getComponentToken: <K extends ComponentName>(name: K) => ComponentTokenMap[K]['token'];
}

export declare function useToken(): UseTokenResult;
