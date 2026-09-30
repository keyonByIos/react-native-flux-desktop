"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.View = void 0;
exports.Text = Text;
exports.Image = Image;
exports.Video = Video;
exports.Pressable = Pressable;
exports.ScrollView = ScrollView;
exports.Window = Window;
// 组件层：PascalCase 的 RN 风格组件，内部一律渲染成小写 intrinsic 标签，
// 由 reconciler 按标签名映射到场景节点。保持这层极薄，是「一套代码跨端」的前提。
const react_1 = __importDefault(require("react"));
// forwardRef：ref 是 React 保留属性，不进 props，须经 forwardRef 透给 'view' 宿主元素；
// 宿主 getPublicInstance 交回场景节点（量测/快照等运行时能力）。
exports.View = react_1.default.forwardRef(function View(props, ref) {
    return react_1.default.createElement('view', { ...props, ref }, props.children);
});
function Text(props) {
    return react_1.default.createElement('text', props, props.children);
}
function Image(props) {
    return react_1.default.createElement('image', props, props.children);
}
function Video(props) {
    return react_1.default.createElement('video', props, props.children);
}
function Pressable(props) {
    const [pressed, setPressed] = react_1.default.useState(false);
    const state = { pressed };
    const style = typeof props.style === 'function' ? props.style(state) : props.style;
    const children = typeof props.children === 'function' ? props.children(state) : props.children;
    return react_1.default.createElement('pressable', {
        ...props,
        style,
        children: undefined,
        onPressIn: () => {
            setPressed(true);
            props.onPressIn && props.onPressIn();
        },
        onPressOut: () => {
            setPressed(false);
            props.onPressOut && props.onPressOut();
        },
    }, children);
}
function ScrollView(props) {
    return react_1.default.createElement('scrollview', props, props.children);
}
function Window(props) {
    return react_1.default.createElement('window', props, props.children);
}
