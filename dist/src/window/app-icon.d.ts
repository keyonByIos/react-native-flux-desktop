/** 建窗后调用：把图标贴到该窗。已解码则立即应用，否则登记待解码完成后补贴。 */
export declare function attachWindowIcon(id: number): void;
/** 建窗前调用一次：给当前进程设独立 AUMID，使任务栏按钮采用我们给窗口设的图标（而非 node.exe 的）。
 *  读 process.env.FLUX_APP_ID；未设或 native 不可用即静默跳过。幂等，只生效一次。 */
export declare function ensureAppUserModelId(): void;
