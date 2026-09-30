"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MciEngine = void 0;
// Windows 音频引擎：MCI（winmm.dll 的 mciSendString），常驻一个 PowerShell 子进程，
// 主线程阻塞读 stdin 命令、STATUS 时向 stdout 回一行 JSON。
//
// 为什么用 MCI 而不是 WMP COM / WPF MediaPlayer：
//   • 二者都要求宿主线程持续泵消息（WMP 要 DoEvents、WPF 要 Dispatcher 循环），一旦阻塞读 stdin
//     不泵消息，播放就卡在 playState=9(Transitioning)、duration 恒为 0、永不发声——这正是
//     「点播放无反应」的根因。MCI 的播放在系统侧线程完成，宿主只需阻塞式收命令，无需任何消息泵。
//   • MCI 走系统注册的解码器（Media Foundation / DirectShow），格式覆盖与资源管理器双击播放一致，
//     但某些编码系统可解器缺位（如部分 m4a）时会解不了——见下方 prepareSrc 的 ffmpeg 预解码。
//
// 【统一走 ffmpeg 预解码】本地非 wav 文件先交给 ffmpeg 解成临时 WAV 再喂 MCI（见 prepareSrc）：
//   ffmpeg 能解的格式转成 PCM/WAV 后 MCI 一定能播，补上了 MCI 依赖系统解码器的短板。
//   ffmpeg 来自 devDependencies 的 ffmpeg-static；生产环境（--omit=dev）不带此包时 resolveFfmpeg 返回
//   null，prepareSrc 原样返回路径→退回纯 MCI 行为（能播则播），整个音视频模块对生产零影响。
//
// 命令词表见 engine.ts（OPEN/PLAY/PAUSE/STOP/SEEK/VOL/QUIT/STATUS）。SEEK 用秒、VOL 用 0..1，
// 内部换算成 MCI 的毫秒与 0..1000。STATUS 回报 {position,duration,playing}（秒、布尔），volume 不回报
// 由基类本地维护。注意 PS 布尔会渲染成 True/False，须手动转小写 true/false 才是合法 JSON。
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const os_1 = require("os");
const path_1 = require("path");
const engine_1 = require("./engine");
const ffmpeg_1 = require("./ffmpeg");
const PS = `
$ErrorActionPreference='SilentlyContinue'
try { [Console]::InputEncoding = [System.Text.Encoding]::UTF8 } catch {}
Add-Type -TypeDefinition 'using System;using System.Text;using System.Runtime.InteropServices;public class Mci{[DllImport("winmm.dll",CharSet=CharSet.Auto)]public static extern int mciSendString(string c,StringBuilder b,int l,IntPtr h);}'
$sb = New-Object System.Text.StringBuilder 512
function MCI($cmd){ [void]$sb.Clear(); [Mci]::mciSendString($cmd,$sb,512,[IntPtr]::Zero) | Out-Null; return $sb.ToString() }
$inv = [System.Globalization.CultureInfo]::InvariantCulture
$mode = 'stopped'
while ($true) {
  $line = [Console]::In.ReadLine()
  if ($null -eq $line) { break }
  $sp = $line.IndexOf(' ')
  if ($sp -lt 0) { $cmd = $line; $arg = '' } else { $cmd = $line.Substring(0,$sp); $arg = $line.Substring($sp+1) }
  switch ($cmd) {
    'OPEN'   { [void](MCI('close media')); [void](MCI('open "' + $arg + '" type mpegvideo alias media')); [void](MCI('set media time format milliseconds')) }
    'PLAY'   { if ($mode -eq 'paused') { [void](MCI('resume media')) } else { [void](MCI('play media')) } }
    'PAUSE'  { [void](MCI('pause media')) }
    'STOP'   { [void](MCI('stop media')) }
    'SEEK'   { $ms = [int]([double]$arg * 1000); if ($mode -eq 'playing') { [void](MCI('play media from ' + $ms)) } else { [void](MCI('seek media to ' + $ms)) } }
    'VOL'    { $v = [int]([double]$arg * 1000); [void](MCI('setaudio media volume to ' + $v)) }
    'QUIT'   { [void](MCI('stop media')); [void](MCI('close media')); break }
    'STATUS' {
      $mode = MCI('status media mode')
      $pos = MCI('status media position')
      $len = MCI('status media length')
      $p = 0.0; $d = 0.0
      [void][double]::TryParse($pos, [ref]$p)
      [void][double]::TryParse($len, [ref]$d)
      $playing = if ($mode -eq 'playing') { 'true' } else { 'false' }
      $ps = [System.Convert]::ToString($p / 1000.0, $inv)
      $ds = [System.Convert]::ToString($d / 1000.0, $inv)
      [Console]::Out.WriteLine('{"position":' + $ps + ',"duration":' + $ds + ',"playing":' + $playing + '}')
    }
  }
}
`;
class MciEngine extends engine_1.StdioEngine {
    constructor() {
        super(...arguments);
        /** 上一次转码生成的临时 wav（下次转码前 / dispose 时清理） */
        this.tmpWav = null;
    }
    /**
     * 统一走 ffmpeg：本地非 wav 文件先解码成临时 WAV 再交给 MCI。
     * wav / URL 原样交给 MCI（wav 本就能直播、URL 由 MCI 流式处理）；无 ffmpeg 时也原样返回。
     */
    async prepareSrc(src) {
        if (/^https?:\/\//i.test(src))
            return src;
        if (/\.wav$/i.test(src))
            return src;
        const ff = (0, ffmpeg_1.resolveFfmpeg)();
        if (!ff)
            return src;
        const tmp = (0, path_1.join)((0, os_1.tmpdir)(), 'flux-audio-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.wav');
        const ok = await transcodeToWav(ff, src, tmp);
        if (ok) {
            this.cleanupTmp();
            this.tmpWav = tmp;
            return tmp;
        }
        return src; // 转码失败：退回原路径（不比现状差）
    }
    cleanupTmp() {
        if (this.tmpWav) {
            try {
                (0, fs_1.unlinkSync)(this.tmpWav);
            }
            catch {
                /* ignore */
            }
            this.tmpWav = null;
        }
    }
    dispose() {
        super.dispose();
        this.cleanupTmp();
    }
    spawnChild() {
        try {
            return (0, child_process_1.spawn)('powershell.exe', ['-NoProfile', '-Command', PS], {
                windowsHide: true,
                stdio: ['pipe', 'pipe', 'ignore'],
            });
        }
        catch {
            this.available = false;
            return null;
        }
    }
    parseState(obj) {
        if (obj && typeof obj.position === 'number') {
            return {
                position: obj.position || 0,
                duration: obj.duration || 0,
                playing: !!obj.playing,
                volume: typeof obj.volume === 'number' ? obj.volume : this.state.volume,
            };
        }
        return null;
    }
}
exports.MciEngine = MciEngine;
exports.default = MciEngine;
/** 用 ffmpeg 把 src 解成 44.1kHz 立体声 16-bit WAV 写入 out；成功返回 true。带 2min 超时。 */
function transcodeToWav(ff, src, out) {
    return new Promise((resolve) => {
        let done = false;
        const finish = (v) => {
            if (!done) {
                done = true;
                resolve(v);
            }
        };
        let child;
        try {
            child = (0, child_process_1.spawn)(ff, ['-y', '-hide_banner', '-loglevel', 'error', '-i', src, '-vn', '-ac', '2', '-ar', '44100', out], {
                windowsHide: true,
                stdio: ['ignore', 'ignore', 'ignore'],
            });
        }
        catch {
            finish(false);
            return;
        }
        const to = setTimeout(() => {
            try {
                child.kill();
            }
            catch {
                /* ignore */
            }
            finish(false);
        }, 120000);
        child.on('error', () => {
            clearTimeout(to);
            finish(false);
        });
        child.on('close', (code) => {
            clearTimeout(to);
            finish(code === 0 && (0, fs_1.existsSync)(out));
        });
    });
}
