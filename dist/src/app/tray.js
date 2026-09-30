"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tray = exports.available = void 0;
// tray.ts —— 系统托盘的 TS 门面：建/换/摘托盘 + 事件分发（EventEmitter）。
//
// 与原生层契约（src/tray.rs）：
//   - createTray(onEvent, rgba, w, h, tooltip)：建托盘（不挂原生菜单）；onEvent 走专用 tsfn，签名 (err, payload)。
//   - pump() 末尾 drain_tray_events() 把 tray-icon 的 receiver 事件转 JSON 回抛，
//     payload 形如 {"type":"tray","action":"click"|"double-click"|"right-click","button":"left"|"right"}。
//   - 本门面按 action 分发：ee.emit(action, ev) + ee.emit('event', ev)，供 on / onLeftClick… 订阅。
// 职责边界：只提供「托盘是什么 + 发生了什么」；左/双击唤主窗、右键渲染自定义主题菜单等交给上层（gallery）路由。
// 依赖纪律：与 db.ts/winit-window.ts 同级叶子，仅 require addon + @napi-rs/canvas，不 import renderer/window。
const events_1 = require("events");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const lab = (() => {
    try {
        return require('../../../index.js');
    }
    catch {
        return null;
    }
})();
/** 原生托盘是否可用（addon 载入且导出 createTray）。不可用时所有操作 no-op（纯 tsc/单测/非原生环境）。 */
exports.available = !!lab && typeof lab.createTray === 'function';
const ee = new events_1.EventEmitter();
let created = false;
/** 解码图标 PNG → RGBA8（同 app-icon.ts 范式）；无路径/解码失败则画占位圆角方块，保证托盘始终可见。 */
async function decodeIcon(iconPath, size) {
    const canvas = (() => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            return require('@napi-rs/canvas');
        }
        catch {
            return null;
        }
    })();
    if (!canvas)
        return placeholder(canvas, size);
    const p = iconPath || process.env.FLUX_ICON;
    if (p) {
        try {
            const img = await canvas.loadImage(p);
            const c = canvas.createCanvas(size, size);
            const ctx = c.getContext('2d');
            ctx.clearRect(0, 0, size, size);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, size, size);
            const data = ctx.getImageData(0, 0, size, size).data;
            return { buf: Buffer.from(data.buffer, data.byteOffset, data.byteLength), w: size, h: size };
        }
        catch {
            /* 落到占位 */
        }
    }
    return placeholder(canvas, size);
}
/** 占位图标：主色圆角方块（canvas 缺失时退化为全透明，native 仍能建托盘）。 */
function placeholder(canvas, size) {
    if (!canvas) {
        return { buf: Buffer.alloc(size * size * 4), w: size, h: size };
    }
    const c = canvas.createCanvas(size, size);
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    const pad = Math.max(1, Math.floor(size * 0.12));
    const r = Math.max(1, Math.floor(size * 0.22));
    ctx.fillStyle = '#3b82f6';
    roundRect(ctx, pad, pad, size - pad * 2, size - pad * 2, r);
    ctx.fill();
    const data = ctx.getImageData(0, 0, size, size).data;
    return { buf: Buffer.from(data.buffer, data.byteOffset, data.byteLength), w: size, h: size };
}
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}
async function doCreate(opts) {
    const size = opts.iconSize ?? 24;
    const icon = await decodeIcon(opts.iconPath, size);
    const onEvent = (err, raw) => {
        if (err || typeof raw !== 'string')
            return;
        let ev;
        try {
            ev = JSON.parse(raw);
        }
        catch {
            return;
        }
        ee.emit(ev.action, ev);
        ee.emit('event', ev);
    };
    try {
        lab.createTray(onEvent, icon.buf, icon.w, icon.h, opts.tooltip ?? 'react-native-flux');
        created = true;
    }
    catch {
        /* native 未就绪：保持未创建 */
    }
}
/** 托盘单例门面（进程级唯一：一个托盘句柄）。 */
exports.tray = {
    available: exports.available,
    /** 是否已建托盘 */
    isCreated() {
        return created;
    },
    /** 建托盘（异步解码图标）。addon 不可用即 no-op。已存在则先摘再建。 */
    create(opts) {
        if (!exports.available)
            return;
        if (created)
            exports.tray.remove();
        void doCreate(opts);
    },
    /** 换图标（PNG 路径同 create 规则）。 */
    setIcon(iconPath, size = 24) {
        if (!exports.available || !created)
            return;
        void decodeIcon(iconPath, size).then((icon) => {
            try {
                lab.setTrayIcon(icon.buf, icon.w, icon.h);
            }
            catch {
                /* ignore */
            }
        });
    },
    /** 换悬浮提示。 */
    setTooltip(text) {
        if (!exports.available || !created)
            return;
        try {
            lab.setTrayTooltip(text);
        }
        catch {
            /* ignore */
        }
    },
    /** 摘除托盘并停回抛。 */
    remove() {
        if (!exports.available)
            return;
        try {
            lab.removeTray();
        }
        catch {
            /* ignore */
        }
        created = false;
    },
    /** 订阅某类事件：action ∈ click|double-click|right-click；或 'event' 收全部。返回退订。 */
    on(action, cb) {
        ee.on(action, cb);
        return () => {
            ee.off(action, cb);
        };
    },
    /** 左键单击托盘图标 */
    onLeftClick(cb) {
        return exports.tray.on('click', cb);
    },
    /** 左键双击托盘图标 */
    onDoubleClick(cb) {
        return exports.tray.on('double-click', cb);
    },
    /** 右键单击托盘图标（用于渲染自定义主题菜单） */
    onRightClick(cb) {
        return exports.tray.on('right-click', cb);
    },
    /**
     * 装填「点外面即关」监听（与 OS 焦点无关，专治置顶菜单点桌面/其它窗不关）。
     * rect：菜单在屏幕上的**物理**矩形（上层把逻辑坐标 × scale 得到）；
     * cb：当全局光标落在 rect 之外且任一键按下时触发一次（原生随即自动解除，一次性）。
     * addon 不可用（非 Windows / 纯 tsc）时 no-op。
     */
    armDismiss(rect, cb) {
        if (!lab || typeof lab.armWatch !== 'function')
            return;
        try {
            lab.armWatch(rect.x, rect.y, rect.w, rect.h, () => cb());
        }
        catch {
            /* native 未就绪：保持未监听 */
        }
    },
    /** 解除「点外面即关」监听（菜单经选中项/失焦等正常关闭时调用，幂等）。 */
    disarmDismiss() {
        if (!lab || typeof lab.disarmWatch !== 'function')
            return;
        try {
            lab.disarmWatch();
        }
        catch {
            /* ignore */
        }
    },
};
