"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvAudioEngine = void 0;
// macOS 音频引擎（留桩，待 Mac 上验证）：常驻一个 `swift` 子进程跑 AVAudioPlayer 助手脚本，
// 与 Windows 引擎共用 engine.ts 的同一套 stdin 命令 / stdout 逐行 JSON 协议。
//
// 选型：AVAudioPlayer（AVFoundation）是 macOS 上 WPF MediaPlayer / WMP COM 的对等物——
//   支持 mp3/wav/aac/m4a，具备 play/pause/stop、currentTime（可 seek）、volume、duration、isPlaying。
// 助手脚本以 `swift <file>.swift` 直解释执行（需 Command Line Tools 提供 `swift`）；
// 若 `swift` 不可用，spawn 触发 'error' → 基类置 available=false，组件降级为不可用显示。
//
// ⚠️ 未验证：本仓在 Windows 上开发，macOS 路径按 API 语义写全但未在真机跑过，后续在 Mac 上核对。
const child_process_1 = require("child_process");
const os_1 = require("os");
const path_1 = require("path");
const fs_1 = require("fs");
const engine_1 = require("./engine");
// Swift 源码：用 String.raw 原样落盘，保留 \(…) 插值与 \n、\" 等转义交给 Swift 解释。
const SWIFT = String.raw `
import AVFoundation
import Foundation

var player: AVAudioPlayer?

func out(_ s: String) {
    FileHandle.standardOutput.write((s + "\n").data(using: .utf8)!)
}

while let line = readLine() {
    let parts = line.split(separator: " ", maxSplits: 1, omittingEmptySubsequences: false)
    let cmd = String(parts.first ?? "")
    let arg = parts.count > 1 ? String(parts[1]) : ""
    switch cmd {
    case "OPEN":
        let url = URL(fileURLWithPath: arg)
        do {
            player = try AVAudioPlayer(contentsOf: url)
            player?.prepareToPlay()
        } catch {
            player = nil
        }
    case "PLAY":
        player?.play()
    case "PAUSE":
        player?.pause()
    case "STOP":
        player?.stop()
        player?.currentTime = 0
    case "SEEK":
        if let t = Double(arg) { player?.currentTime = t }
    case "VOL":
        if let v = Float(arg) { player?.volume = v }
    case "QUIT":
        exit(0)
    case "STATUS":
        let pos = player?.currentTime ?? 0
        let dur = player?.duration ?? 0
        let playing = player?.isPlaying ?? false
        let vol = player?.volume ?? 0
        out("{\"position\":\(pos),\"duration\":\(dur),\"playing\":\(playing),\"volume\":\(vol)}")
    default:
        break
    }
}
`;
class AvAudioEngine extends engine_1.StdioEngine {
    /** AVAudioPlayer 不能直接流式播放 http URL：先把网络音频下载到临时文件再交给助手（Windows 的 WMP 能直接吃 URL，故只有这里覆写） */
    async prepareSrc(src) {
        if (!/^https?:\/\//i.test(src))
            return src;
        try {
            const res = await fetch(src);
            if (!res.ok)
                return src;
            const buf = Buffer.from(await res.arrayBuffer());
            const m = src.split('?')[0].match(/\.[a-z0-9]+$/i);
            const ext = m ? m[0] : '.audio';
            const p = (0, path_1.join)((0, os_1.tmpdir)(), 'flux-audio-' + Date.now() + ext);
            (0, fs_1.writeFileSync)(p, buf);
            return p;
        }
        catch {
            return src;
        }
    }
    spawnChild() {
        try {
            const helper = (0, path_1.join)((0, os_1.tmpdir)(), 'flux-av-helper.swift');
            (0, fs_1.writeFileSync)(helper, SWIFT);
            return (0, child_process_1.spawn)('swift', [helper], { stdio: ['pipe', 'pipe', 'ignore'] });
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
exports.AvAudioEngine = AvAudioEngine;
exports.default = AvAudioEngine;
