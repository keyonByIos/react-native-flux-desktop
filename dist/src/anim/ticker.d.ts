export type TickerCallback = (now: number) => void;
/** 订阅每一帧；返回退订函数。 */
export declare function subscribe(cb: TickerCallback): () => void;
/** 当前活跃订阅数（host 滚动条带缓存据此判定「有无动画在跑」：>0 则不可增量 blit，须整帧重绘） */
export declare function activeCount(): number;
