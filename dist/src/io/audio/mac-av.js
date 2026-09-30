"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.AvAudioEngine=void 0;const child_process_1=require("child_process"),os_1=require("os"),path_1=require("path"),fs_1=require("fs"),engine_1=require("./engine"),SWIFT=String.raw`
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
`;class AvAudioEngine extends engine_1.StdioEngine{async prepareSrc(e){if(!/^https?:\/\//i.test(e))return e;try{const t=await fetch(e);if(!t.ok)return e;const r=Buffer.from(await t.arrayBuffer()),i=e.split("?")[0].match(/\.[a-z0-9]+$/i),a=i?i[0]:".audio",n=(0,path_1.join)((0,os_1.tmpdir)(),"flux-audio-"+Date.now()+a);return(0,fs_1.writeFileSync)(n,r),n}catch{return e}}spawnChild(){try{const e=(0,path_1.join)((0,os_1.tmpdir)(),"flux-av-helper.swift");return(0,fs_1.writeFileSync)(e,SWIFT),(0,child_process_1.spawn)("swift",[e],{stdio:["pipe","pipe","ignore"]})}catch{return this.available=!1,null}}parseState(e){return e&&"number"==typeof e.position?{position:e.position||0,duration:e.duration||0,playing:!!e.playing,volume:"number"==typeof e.volume?e.volume:this.state.volume}:null}}exports.AvAudioEngine=AvAudioEngine,exports.default=AvAudioEngine;