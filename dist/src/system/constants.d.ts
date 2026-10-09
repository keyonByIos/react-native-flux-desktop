/** CPU 概要（取首个物理核的型号/标称频率 + 逻辑核总数） */
export interface CpuSummary {
    /** CPU 型号字符串（多核取第一个） */
    model: string;
    /** 标称主频（MHz，取第一个核；部分平台为 0） */
    speedMHz: number;
    /** 逻辑核心数 */
    cores: number;
}
/** 系统静态常量的完整结构（字段均只读） */
export interface SystemConstants {
    /** Node 平台标识：'win32' | 'darwin' | 'linux' | 'freebsd' | ... */
    platform: string;
    /** 人类可读平台名：Windows / macOS / Linux / FreeBSD / ... */
    platformName: string;
    /** CPU 架构：'x64' | 'arm64' | 'ia32' | ... */
    arch: string;
    /** 位宽：32 或 64（由 arch 推断，未知为 0） */
    bits: number;
    /** 是否 Windows */
    isWindows: boolean;
    /** 是否 macOS */
    isMacOS: boolean;
    /** 是否 Linux */
    isLinux: boolean;
    /** 是否类 Unix（darwin / linux / freebsd / sunos 等，非 win32） */
    isUnix: boolean;
    /** os.type()：'Windows_NT' | 'Darwin' | 'Linux' | ... */
    osType: string;
    /** os.release()：操作系统版本号（如 '10.0.22631' / '23.5.0' / '6.8.0-...'） */
    osRelease: string;
    /** os.endianness()：'LE' | 'BE' */
    endianness: string;
    /** 主机名（计算机名） */
    hostname: string;
    /** 当前用户名 */
    username: string;
    /** 用户主目录 */
    homedir: string;
    /** 系统临时目录 */
    tmpdir: string;
    /** 默认 shell（取不到为空串） */
    shell: string;
    /** POSIX uid（Windows 下通常为 -1 / 0，不代表无权限） */
    uid: number;
    /** POSIX gid（Windows 下通常为 -1 / 0） */
    gid: number;
    /** CPU 概要（型号 / 主频 / 核数） */
    cpu: CpuSummary;
    /** 逻辑核心总数 */
    cpuCount: number;
    /** 整机物理内存总字节 */
    totalMemBytes: number;
    /** 整机物理内存总量（GB，1GB=1024^3） */
    totalMemGB: number;
    /** process.version，如 'v20.11.1' */
    nodeVersion: string;
    /** Node 主版本号 */
    nodeMajor: number;
    /** Node 次版本号 */
    nodeMinor: number;
    /** Node 修订号 */
    nodePatch: number;
    /** V8 引擎版本 */
    v8Version: string;
    /** libuv 版本 */
    uvVersion: string;
    /** N-API 支持版本 */
    napiVersion: string;
    /** OpenSSL 版本（无则空串） */
    opensslVersion: string;
    /** 模块 ABI 版本（加载原生 addon 需匹配） */
    modulesVersion: string;
    /** process.versions 全量映射（各依赖组件版本） */
    versions: Record<string, string>;
    /** 当前进程 pid */
    pid: number;
    /** 父进程 ppid */
    ppid: number;
    /** 可执行文件路径（dev 下为 node，打包后为 app.exe） */
    execPath: string;
    /** 进程标题（process.title） */
    title: string;
    /** 启动参数 argv */
    argv: string[];
    /** IANA 时区名，如 'Asia/Shanghai' */
    timezone: string;
    /** UTC 相对本地的偏移（分钟，同 getTimezoneOffset 语义） */
    timezoneOffsetMin: number;
    /** BCP-47 区域，如 'zh-CN' */
    locale: string;
    /** 首选语言（读不到回退 locale） */
    language: string;
}
/** 系统静态常量单例（模块加载时算一次并冻结，之后只读）。 */
export declare const systemConstants: SystemConstants;
/** 便捷：把常量表输出为缩进 JSON 字符串（demo 展示 / 复制到剪贴板用）。 */
export declare function systemConstantsJSON(indent?: number): string;
