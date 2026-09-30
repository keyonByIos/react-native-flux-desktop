"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickFiles = pickFiles;
exports.saveFile = saveFile;
// 原生文件对话框门面：走 PowerShell 的 System.Windows.Forms.OpenFileDialog（无需 napi/Rust）。
// spawnSync 阻塞式：模态框期间本进程 pump 暂停，但窗口本就被系统模态遮住，可接受。
// 返回用户选中的绝对路径数组（取消 = 空数组）。仅 Windows 有效；失败静默返回空。
//
// ⚠️ 编码坑：PowerShell 控制台 stdout 用系统代码页（中文 Windows 为 GBK），Node 按 utf8 解码会把
//    中文文件名打成乱码，且乱码路径喂 statSync 找不到文件（连带丢失文件大小）。故不让结果走 stdout，
//    改由 PowerShell 以 UTF-8(无 BOM) 写入临时文件，Node 再 utf8 读回，彻底绕开代码页问题。
const child_process_1 = require("child_process");
const os_1 = require("os");
const path_1 = require("path");
const fs_1 = require("fs");
/** 规范化扩展名：去空格、去前导点、转小写，过滤空项 */
function normalizeExt(accept) {
    if (!accept)
        return [];
    return accept
        .map((e) => e.trim().replace(/^\./, '').toLowerCase())
        .filter(Boolean);
}
/** PowerShell 单引号字符串转义：内部单引号翻倍 */
function psQuote(s) {
    return "'" + s.replace(/'/g, "''") + "'";
}
/**
 * 打开系统文件选择框。
 * @returns 选中文件绝对路径数组；用户取消或环境不支持时返回空数组。
 */
function pickFiles(opts = {}) {
    const exts = normalizeExt(opts.accept);
    // Windows 对话框过滤串：形如 "自定义|*.png;*.jpg|所有文件|*.*"
    let filter = '*.*|*.*';
    if (exts.length) {
        const pat = exts.map((e) => '*.' + e).join(';');
        filter = `自定义 (${pat.replace(/\*/g, '')})|${pat}|所有文件|*.*`;
    }
    const title = opts.title || '选择文件';
    // 结果落地用的临时文件（唯一名，读后即删）
    const out = (0, path_1.join)((0, os_1.tmpdir)(), `flux-pick-${Date.now()}-${Math.random().toString(36).slice(2)}.txt`);
    const script = [
        '$ErrorActionPreference="SilentlyContinue"',
        'Add-Type -AssemblyName System.Windows.Forms | Out-Null',
        '$d = New-Object System.Windows.Forms.OpenFileDialog',
        `$d.Multiselect = $${opts.multiple ? 'true' : 'false'}`,
        `$d.Filter = ${psQuote(filter)}`,
        `$d.Title = ${psQuote(title)}`,
        '$d.CheckFileExists = $true',
        '$sel = @()',
        'if ($d.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { $sel = $d.FileNames }',
        '$enc = New-Object System.Text.UTF8Encoding($false)',
        `[System.IO.File]::WriteAllText(${psQuote(out)}, ($sel -join [char]10), $enc)`,
    ].join('\n');
    try {
        (0, child_process_1.spawnSync)('powershell.exe', ['-NoProfile', '-STA', '-Command', script], { windowsHide: true });
        let text = '';
        try {
            text = (0, fs_1.readFileSync)(out, 'utf8');
        }
        catch {
            return []; // 未生成文件 = 取消或失败
        }
        try {
            (0, fs_1.unlinkSync)(out);
        }
        catch {
            /* 忽略清理失败 */
        }
        if (text.charCodeAt(0) === 0xfeff)
            text = text.slice(1); // 兜底去 BOM
        return text
            .split('\n')
            .map((s) => s.replace(/\r$/, ''))
            .filter(Boolean);
    }
    catch {
        return [];
    }
}
/**
 * 打开系统「另存为」对话框，让用户选定一个写入目标路径。
 * 与 pickFiles 同款 UTF-8 临时文件回传（绕开 GBK 控制台代码页），故中文路径无损。
 * @returns 用户选定的绝对路径；取消或环境不支持时返回空串（调用方据此放弃写入）。
 */
function saveFile(opts = {}) {
    const exts = normalizeExt(opts.accept);
    let filter = '*.*|*.*';
    if (exts.length) {
        const pat = exts.map((e) => '*.' + e).join(';');
        filter = `自定义 (${pat.replace(/\*/g, '')})|${pat}|所有文件|*.*`;
    }
    const title = opts.title || '保存文件';
    const out = (0, path_1.join)((0, os_1.tmpdir)(), `flux-save-${Date.now()}-${Math.random().toString(36).slice(2)}.txt`);
    const lines = [
        '$ErrorActionPreference="SilentlyContinue"',
        'Add-Type -AssemblyName System.Windows.Forms | Out-Null',
        '$d = New-Object System.Windows.Forms.SaveFileDialog',
        `$d.Filter = ${psQuote(filter)}`,
        `$d.Title = ${psQuote(title)}`,
        '$d.AddExtension = $true',
        '$d.OverwritePrompt = $true',
    ];
    if (opts.defaultName)
        lines.push(`$d.FileName = ${psQuote(opts.defaultName)}`);
    if (opts.defaultDir)
        lines.push(`$d.InitialDirectory = ${psQuote(opts.defaultDir)}`);
    lines.push('$sel = @()', 'if ($d.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { $sel = @($d.FileName) }', '$enc = New-Object System.Text.UTF8Encoding($false)', `[System.IO.File]::WriteAllText(${psQuote(out)}, ($sel -join [char]10), $enc)`);
    try {
        (0, child_process_1.spawnSync)('powershell.exe', ['-NoProfile', '-STA', '-Command', lines.join('\n')], { windowsHide: true });
        let text = '';
        try {
            text = (0, fs_1.readFileSync)(out, 'utf8');
        }
        catch {
            return ''; // 未生成文件 = 取消或失败
        }
        try {
            (0, fs_1.unlinkSync)(out);
        }
        catch {
            /* 忽略清理失败 */
        }
        if (text.charCodeAt(0) === 0xfeff)
            text = text.slice(1);
        return text.split('\n').map((s) => s.replace(/\r$/, '')).filter(Boolean)[0] || '';
    }
    catch {
        return '';
    }
}
