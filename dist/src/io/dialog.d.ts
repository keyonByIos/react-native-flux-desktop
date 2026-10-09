export interface PickFilesOptions {
    /** 允许多选 */
    multiple?: boolean;
    /** 扩展名过滤，如 ['.png', '.jpg']（无前导点亦可）；留空 = 全部文件 */
    accept?: string[];
    /** 对话框标题 */
    title?: string;
}
/**
 * 打开系统文件选择框。
 * @returns 选中文件绝对路径数组；用户取消或环境不支持时返回空数组。
 */
export declare function pickFiles(opts?: PickFilesOptions): string[];
export interface SaveFileOptions {
    /** 扩展名过滤，如 ['.txt', '.json']（无前导点亦可）；留空 = 全部文件 */
    accept?: string[];
    /** 对话框标题 */
    title?: string;
    /** 默认文件名（含扩展名），对话框打开时预填 */
    defaultName?: string;
    /** 默认所在目录 */
    defaultDir?: string;
}
/**
 * 打开系统「另存为」对话框，让用户选定一个写入目标路径。
 * 与 pickFiles 同款 UTF-8 临时文件回传（绕开 GBK 控制台代码页），故中文路径无损。
 * @returns 用户选定的绝对路径；取消或环境不支持时返回空串（调用方据此放弃写入）。
 */
export declare function saveFile(opts?: SaveFileOptions): string;
