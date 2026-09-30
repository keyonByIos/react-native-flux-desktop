export type TickerCallback = (now: number) => void;

export declare function subscribe(cb: TickerCallback): () => void;

export declare function activeCount(): number;
