"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoOutput = VideoOutput;
// VideoOutput：视频输出播放卡（I/O 输出组件）。v1 明确「纯画面·无声」——ffmpeg 把视频解成 RGBA 帧，
// 按帧率节奏 blit 进自绘画布（跨平台，只依赖可选的 ffmpeg-static，生产 --omit=dev 即整块降级为提示）。
// UI 提供 播放/暂停、±5s 快进退、重播、进度显示；可选内嵌 FilePicker 选本地视频。
//
// 交互取舍（同 AudioOutput）：自绘 Pressable.onPress 不带坐标，进度条为「只读显示」，seek 用 ±5s 按钮。
// 注意：每个实例常驻一条 ffmpeg 解码管道 + 一个 fps 定时器；一页多实例可接受（学习/演示场景）。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../../ui/icon");
const file_picker_1 = require("../file-picker");
const ffmpeg_1 = require("../audio/ffmpeg");
const frames_1 = require("../video/frames");
const VIDEO_EXT = ['.mp4', '.mov', '.mkv', '.webm', '.avi', '.m4v', '.flv', '.wmv', '.mpeg', '.mpg', '.3gp'];
let nextVideoId = 1;
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
function VideoOutput(props) {
    const { token } = (0, theme_1.useToken)();
    const { src, title, autoPlay, showFilePicker = false, maxEdge, resizeMode = 'contain', height = 220, onState, style } = props;
    const idRef = react_1.default.useRef(0);
    if (!idRef.current)
        idRef.current = nextVideoId++;
    const videoId = idRef.current;
    const decoderRef = react_1.default.useRef(null);
    const [innerSrc, setInnerSrc] = react_1.default.useState(undefined);
    const cur = src !== undefined ? src : innerSrc;
    const [meta, setMeta] = react_1.default.useState(null);
    const [status, setStatus] = react_1.default.useState('idle');
    const [playing, setPlaying] = react_1.default.useState(false);
    const [position, setPosition] = react_1.default.useState(0);
    const available = (0, ffmpeg_1.isFfmpegAvailable)();
    const loading = status === 'loading';
    const ready = status === 'ready';
    const duration = meta ? meta.duration : 0;
    const ratio = duration > 0 ? Math.max(0, Math.min(1, position / duration)) : 0;
    // 卸载即释放解码管道 + 帧槽
    react_1.default.useEffect(() => () => {
        if (decoderRef.current)
            decoderRef.current.dispose();
        decoderRef.current = null;
    }, []);
    // 源变化：探测 → 建解码器 → 起流；缺 ffmpeg 或解析失败即降级
    react_1.default.useEffect(() => {
        if (decoderRef.current) {
            decoderRef.current.dispose();
            decoderRef.current = null;
        }
        setMeta(null);
        setPlaying(false);
        setPosition(0);
        if (!cur) {
            setStatus('idle');
            return;
        }
        let cancelled = false;
        setStatus('loading');
        (0, frames_1.probe)(cur)
            .then((m) => {
            if (cancelled)
                return;
            const d = new frames_1.FrameDecoder({ id: videoId, src: cur, maxEdge }, m);
            d.onState = (s) => {
                setPosition(s.position);
                setPlaying(s.playing);
                if (onState)
                    onState(s);
            };
            d.onEnd = () => setPlaying(false);
            decoderRef.current = d;
            setMeta(m);
            setStatus('ready');
            d.start(!!autoPlay);
        })
            .catch(() => {
            if (cancelled)
                return;
            setStatus((0, ffmpeg_1.isFfmpegAvailable)() ? 'error' : 'unavailable');
        });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cur]);
    const toggle = () => {
        const d = decoderRef.current;
        if (!d || loading)
            return;
        if (playing)
            d.pause();
        else
            d.play();
    };
    const skip = (delta) => {
        const d = decoderRef.current;
        if (!d)
            return;
        d.seek(Math.max(0, Math.min(duration || 0, position + delta)));
    };
    const replay = () => {
        const d = decoderRef.current;
        if (!d)
            return;
        d.seek(0);
        d.play();
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
    const ctrlBtn = (name, onPress) => (react_1.default.createElement(components_1.Pressable, { onPress: onPress, disabled: !ready || loading, style: { padding: token.paddingXS } },
        react_1.default.createElement(icon_1.Icon, { name: name, size: token.fontSizeLG, color: token.colorTextSecondary })));
    const stageStyle = meta
        ? { width: '100%', aspectRatio: meta.width / meta.height, borderRadius: token.borderRadius, backgroundColor: '#0b0b0b', position: 'relative' }
        : { width: '100%', height, borderRadius: token.borderRadius, backgroundColor: '#0b0b0b', position: 'relative' };
    const overlay = !ready ? (react_1.default.createElement(components_1.View, { style: {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            gap: token.marginXS,
        } },
        loading ? react_1.default.createElement(icon_1.Icon, { name: "loading", animate: "spin", size: 26, color: token.colorTextLightSolid }) : null,
        react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextLightSolid } }, loading ? '正在解码视频…' : status === 'unavailable' ? '需 ffmpeg（可选依赖，未检测到）' : status === 'error' ? '解码失败：格式不支持或文件损坏' : '选择或加载一个视频文件'))) : null;
    return (react_1.default.createElement(components_1.View, { style: [card, style] },
        react_1.default.createElement(components_1.View, { style: stageStyle },
            react_1.default.createElement(components_1.Video, { videoId: videoId, resizeMode: resizeMode, style: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 } }),
            overlay),
        react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: token.marginMD } },
            react_1.default.createElement(components_1.Pressable, { onPress: toggle, disabled: !available || !ready || loading, style: {
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: token.colorPrimary,
                    opacity: available && ready && !loading ? 1 : 0.5,
                } },
                react_1.default.createElement(icon_1.Icon, { name: loading ? 'loading' : playing ? 'pause' : 'play', animate: loading ? 'spin' : undefined, size: 22, color: token.colorTextLightSolid })),
            react_1.default.createElement(components_1.View, { style: { flex: 1 } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeLG, color: token.colorText }, numberOfLines: 1 }, title || (cur ? baseName(cur) : '未选择视频')),
                react_1.default.createElement(components_1.Text, { style: { marginTop: 2, fontSize: token.fontSizeSM, color: loading ? token.colorPrimary : token.colorTextTertiary }, numberOfLines: 1 }, loading ? '正在解码视频…（首帧就绪后自动起播）' : meta ? `${meta.width}×${meta.height} · ${Math.round(meta.fps)}fps · 无声预览 v1` : cur ? cur : '选择或加载一个视频文件'))),
        react_1.default.createElement(components_1.View, null,
            react_1.default.createElement(components_1.View, { style: { height: 4, borderRadius: 2, backgroundColor: token.colorFillSecondary } },
                react_1.default.createElement(components_1.View, { style: { height: 4, borderRadius: 2, backgroundColor: token.colorPrimary, width: ratio * 100 + '%' } })),
            react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', justifyContent: 'space-between', marginTop: token.marginXXS } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextTertiary } }, mmss(position)),
                react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextTertiary } }, mmss(duration)))),
        react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: token.marginXS } },
            ctrlBtn('skipBack', () => skip(-5)),
            ctrlBtn('skipForward', () => skip(5)),
            ctrlBtn('reload2', replay),
            react_1.default.createElement(components_1.View, { style: { flex: 1 } }),
            !available ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorWarning } }, "\u89C6\u9891\u9884\u89C8\u9700 ffmpeg\uFF08devDep ffmpeg-static\uFF0C\u751F\u4EA7\u4E0D\u5185\u7F6E\uFF09")) : null),
        showFilePicker ? (react_1.default.createElement(file_picker_1.FilePicker, { accept: VIDEO_EXT, variant: "button", title: "\u9009\u62E9\u89C6\u9891\u6587\u4EF6", value: cur ? [cur] : [], onChange: (f) => setInnerSrc(f.length ? f[f.length - 1] : undefined) })) : null));
}
exports.default = VideoOutput;
