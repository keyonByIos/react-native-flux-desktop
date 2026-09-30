"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
exports.useApp = useApp;
// App —— antd v5 风格的包裹组件：把 message / modal / notification 三个命令式句柄聚到一个 Context，
// 后代用 `const { message, modal, notification } = App.useApp()` 全局调用，浮层就地渲染进「最近的 relative 祖先」
// （本自绘栈无 portal，与 message.useMessage 的 contextHolder 同一锚点范式）。仅主窗口包裹 <App>，其他窗口暂待定。
//
// 与 antd 对齐的 props：message?: MessageOptions、notification?: NotificationOptions、modal?: ModalOptions
// 作为三个 holder 的全局默认；`component`（包裹渲染的容器元素）按用户要求暂不实现。
const react_1 = __importStar(require("react"));
const message_1 = require("../message");
const modal_1 = require("../modal");
const notification_1 = require("../notification");
const AppContext = (0, react_1.createContext)(null);
/** 读取最近 <App> 提供的 message/modal/notification 句柄；必须在 <App> 内调用。 */
function useApp() {
    const v = (0, react_1.useContext)(AppContext);
    if (!v) {
        throw new Error('App.useApp() 必须在 <App> 包裹的组件树内调用');
    }
    return v;
}
function AppInner(props) {
    const { message: messageCfg, notification: notificationCfg, children } = props;
    const [messageApi, messageHolder] = (0, message_1.useMessage)(messageCfg ?? {});
    const [modalApi, modalHolder] = (0, modal_1.useModal)();
    const [notificationApi, notificationHolder] = (0, notification_1.useNotification)(notificationCfg ?? {});
    const value = (0, react_1.useMemo)(() => ({ message: messageApi, modal: modalApi, notification: notificationApi }), [messageApi, modalApi, notificationApi]);
    // 不额外套布局盒：children 原样渲染，三个 holder 作为浮层锚到最近的 relative 祖先（= 窗口内容根）。
    return (react_1.default.createElement(AppContext.Provider, { value: value },
        children,
        messageHolder,
        notificationHolder,
        modalHolder));
}
/** antd 风格 <App> 组件 + App.useApp() 静态方法。 */
exports.App = Object.assign(AppInner, { useApp });
exports.default = exports.App;
