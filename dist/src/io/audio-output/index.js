"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioOutput = AudioOutput;
// AudioOutput：音频输出播放卡（I/O 输出组件）。跨平台引擎见 ../audio/engine（Windows=MCI，
// macOS=AVAudioPlayer，按 process.platform 自动选择）。UI 提供 播放/暂停、±10s 快进快退、进度显示、
// 音量/静音、循环；可选内嵌 FilePicker 选本地音频；可选 showWaveform 画波形（见 ./waveform）。
//
// 交互取舍：自绘管线里 Pressable.onPress 不带坐标，进度条暂为「只读显示」（不可点击/拖拽 seek），
// seek 用 ±10s 按钮替代——与 Splitter 拖拽受限于同一 pointer-move 缺口。
//
// 注意：每个实例常驻一个引擎子进程；一页多个播放卡会各起一个进程，demo 场景可接受。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../../ui/icon");
const file_picker_1 = require("../file-picker");
const waveform_1 = require("./waveform");
const ffmpeg_1 = require("../audio/ffmpeg");
const engine_1 = require("../audio/engine");
const AUDIO_EXT = ['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg', '.wma'];
function mmss(s) {
    if (!Number.isFinite(s) || s < 0)
        s = 0;
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
}
function baseName(p) {
    const a = p.split(/[\\/]/);
    return a[a.length - 1] || p;
}
function AudioOutput(props) {
    const { token } = (0, theme_1.useToken)();
    const { src, title, artist, defaultVolume = 0.8, loop: loopProp = false, autoPlay, showFilePicker = false, showWaveform = false, onState, style } = props;
    const engineRef = react_1.default.useRef(null);
    if (!engineRef.current)
        engineRef.current = (0, engine_1.createAudioEngine)();
    const engine = engineRef.current;
    const [innerSrc, setInnerSrc] = react_1.default.useState(undefined);
    const cur = src !== undefined ? src : innerSrc;
    const [state, setState] = react_1.default.useState({ position: 0, duration: 0, playing: false, volume: defaultVolume });
    const [loop, setLoop] = react_1.default.useState(loopProp);
    const [muted, setMuted] = react_1.default.useState(false);
    const lastVol = react_1.default.useRef(defaultVolume);
    // 加载/解码中：非 wav 文件需 ffmpeg 预解码成临时 wav（大文件数秒），期间禁用控制并显示转圈
    const [loading, setLoading] = react_1.default.useState(false);
    // 波形数据（仅 showWaveform 时懒算）：WAV 走纯 Node 解析，其它格式需 ffmpeg，缺失即降级
    const [wave, setWave] = react_1.default.useState({
        peaks: null,
        status: 'idle',
    });
    // 订阅引擎状态 + 卸载即释放子进程
    react_1.default.useEffect(() => {
        engine.setOnState((s) => {
            setState(s);
            if (onState)
                onState(s);
        });
        return () => {
            engine.setOnState(null);
            engine.dispose();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [engine]);
    react_1.default.useEffect(() => {
        engine.setVolume(defaultVolume);
    }, [engine, defaultVolume]);
    react_1.default.useEffect(() => {
        engine.setLoop(loop);
    }, [engine, loop]);
    react_1.default.useEffect(() => {
        if (!cur) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        engine
            .load(cur, { autoplay: autoPlay })
            .then(() => {
            if (!cancelled)
                setLoading(false);
        })
            .catch(() => {
            if (!cancelled)
                setLoading(false);
        });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [engine, cur]);
    react_1.default.useEffect(() => {
        if (!showWaveform)
            return;
        if (!cur) {
            setWave({ peaks: null, status: 'idle' });
            return;
        }
        let cancelled = false;
        setWave({ peaks: null, status: 'loading' });
        (0, ffmpeg_1.computePeaks)(cur)
            .then((r) => {
            if (cancelled)
                return;
            if (r && r.peaks.length)
                setWave({ peaks: r.peaks, status: 'ready' });
            else
                setWave({ peaks: null, status: 'unavailable' });
        })
            .catch(() => {
            if (!cancelled)
                setWave({ peaks: null, status: 'unavailable' });
        });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showWaveform, cur]);
    const available = engine.available;
    const dur = state.duration;
    const ratio = dur > 0 ? Math.max(0, Math.min(1, state.position / dur)) : 0;
    const toggle = () => {
        if (!available || loading)
            return;
        if (state.playing)
            engine.pause();
        else
            engine.play();
    };
    const skip = (d) => {
        if (!available)
            return;
        const t = Math.max(0, Math.min(dur || 0, state.position + d));
        engine.seek(t);
    };
    const replay = () => {
        if (!available)
            return;
        engine.seek(0);
        engine.play();
    };
    const toggleMute = () => {
        if (muted) {
            engine.setVolume(lastVol.current || 0.8);
            setMuted(false);
        }
        else {
            lastVol.current = state.volume || defaultVolume;
            engine.setVolume(0);
            setMuted(true);
        }
    };
    const changeVol = (d) => {
        const base = muted ? lastVol.current : state.volume;
        const v = Math.max(0, Math.min(1, base + d));
        lastVol.current = v;
        engine.setVolume(v);
        setState((s) => ({ ...s, volume: v }));
    };
    const card = {
        width: '100%',
        padding: token.paddingLG,
        borderRadius: token.borderRadiusLG,
        backgroundColor: token.colorFillQuaternary,
        borderWidth: 1,
        borderColor: token.colorBorderSecondary,
        gap: token.marginMD,
    };
    const ctrlBtn = (name, active, onPress) => (react_1.default.createElement(components_1.Pressable, { onPress: onPress, disabled: !available || loading, style: { padding: token.paddingXS } },
        react_1.default.createElement(icon_1.Icon, { name: name, size: token.fontSizeLG, color: active ? token.colorPrimary : token.colorTextSecondary })));
    return (react_1.default.createElement(components_1.View, { style: [card, style] },
        react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: token.marginMD } },
            react_1.default.createElement(components_1.Pressable, { onPress: toggle, disabled: !available || loading, style: {
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: token.colorPrimary,
                    opacity: available && !loading ? 1 : 0.5,
                } },
                react_1.default.createElement(icon_1.Icon, { name: loading ? 'loading' : state.playing ? 'pause' : 'play', animate: loading ? 'spin' : undefined, size: 22, color: token.colorTextLightSolid })),
            react_1.default.createElement(components_1.View, { style: { flex: 1 } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeLG, color: token.colorText }, numberOfLines: 1 }, title || (cur ? baseName(cur) : '未选择音频')),
                react_1.default.createElement(components_1.Text, { style: { marginTop: 2, fontSize: token.fontSizeSM, color: loading ? token.colorPrimary : token.colorTextTertiary }, numberOfLines: 1 }, loading ? '正在解码音频…（非 WAV 需转码，大文件请稍候）' : artist || (cur ? cur : '选择或加载一个音频文件')))),
        react_1.default.createElement(components_1.View, null,
            showWaveform ? (wave.peaks ? (react_1.default.createElement(waveform_1.AudioWaveform, { peaks: wave.peaks, progress: ratio, height: 56 })) : (react_1.default.createElement(components_1.View, { style: { height: 56, justifyContent: 'center' } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextTertiary } }, wave.status === 'loading'
                    ? '正在解析波形…'
                    : wave.status === 'unavailable'
                        ? '波形需系统 ffmpeg（可选依赖，当前不可用）' + ((0, ffmpeg_1.isFfmpegAvailable)() ? '' : '：未检测到 ffmpeg')
                        : '等待音频…')))) : (react_1.default.createElement(components_1.View, { style: { height: 4, borderRadius: 2, backgroundColor: token.colorFillSecondary } },
                react_1.default.createElement(components_1.View, { style: { height: 4, borderRadius: 2, backgroundColor: token.colorPrimary, width: ratio * 100 + '%' } }))),
            react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', justifyContent: 'space-between', marginTop: token.marginXXS } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextTertiary } }, mmss(state.position)),
                react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextTertiary } }, mmss(dur)))),
        react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: token.marginXS } },
            ctrlBtn('skipBack', false, () => skip(-10)),
            ctrlBtn('skipForward', false, () => skip(10)),
            ctrlBtn('reload2', false, replay),
            react_1.default.createElement(components_1.View, { style: { width: token.marginXS } }),
            ctrlBtn(muted || state.volume <= 0 ? 'volumeX' : 'sound', false, toggleMute),
            ctrlBtn('minus', false, () => changeVol(-0.1)),
            ctrlBtn('plus', false, () => changeVol(0.1)),
            react_1.default.createElement(components_1.View, { style: { flex: 1 } }),
            react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextTertiary } },
                Math.round((muted ? 0 : state.volume) * 100),
                "%")),
        !available ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorWarning } }, "\u5F53\u524D\u5E73\u53F0\u65E0\u53EF\u7528\u97F3\u9891\u5F15\u64CE\uFF08Windows \u4F9D\u8D56\u7CFB\u7EDF MCI/winmm\uFF1BmacOS \u4F9D\u8D56 Command Line Tools \u7684 swift\uFF09")) : null,
        showFilePicker ? (react_1.default.createElement(file_picker_1.FilePicker, { accept: AUDIO_EXT, variant: "button", title: "\u9009\u62E9\u97F3\u9891\u6587\u4EF6", value: cur ? [cur] : [], onChange: (f) => setInnerSrc(f.length ? f[f.length - 1] : undefined) })) : null));
}
exports.default = AudioOutput;
