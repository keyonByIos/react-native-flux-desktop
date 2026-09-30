"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathRoundRect = pathRoundRect;
exports.setImageReadyNotifier = setImageReadyNotifier;
exports.preloadImage = preloadImage;
exports.preloadImages = preloadImages;
exports.isImageReady = isImageReady;
exports.getPaintDpr = getPaintDpr;
exports.putCachedCanvas = putCachedCanvas;
exports.dropCachedCanvas = dropCachedCanvas;
exports.imageCacheStats = imageCacheStats;
exports.setDefaultTextColor = setDefaultTextColor;
exports.bitmapStats = bitmapStats;
exports.imagesPending = imagesPending;
exports.getImageGen = getImageGen;
exports.paintTree = paintTree;
exports.createSurface = createSurface;
// Painter：深度优先遍历场景树，把每个节点画到 canvas 2D 上下文上。
// 这里没有任何 Qt 参与——圆角、描边、文字、裁剪全部由 Skia 光栅化，天生抗锯齿。
const canvas_1 = require("@napi-rs/canvas");
const node_1 = require("../scene/node");
const flatten_1 = require("../style/flatten");
const textLayout_1 = require("../paint/textLayout");
const fonts_1 = require("./fonts");
const registry_1 = require("../io/video/registry");
/** 圆角矩形路径（物理像素坐标也可用，host 滚动 blit 的视口蒙版直接拿 dpr 缩放后的半径进来） */
function pathRoundRect(ctx, x, y, w, h, r) {
    roundRectPath(ctx, x, y, w, h, r);
}
/** 圆角矩形路径；四角可不同，半径自动按短边一半收敛 */
function roundRectPath(ctx, x, y, w, h, r) {
    const maxR = Math.min(w, h) / 2;
    const tl = Math.min(r.tl, maxR);
    const tr = Math.min(r.tr, maxR);
    const br = Math.min(r.br, maxR);
    const bl = Math.min(r.bl, maxR);
    ctx.beginPath();
    ctx.moveTo(x + tl, y);
    ctx.lineTo(x + w - tr, y);
    if (tr > 0)
        ctx.arcTo(x + w, y, x + w, y + tr, tr);
    ctx.lineTo(x + w, y + h - br);
    if (br > 0)
        ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
    ctx.lineTo(x + bl, y + h);
    if (bl > 0)
        ctx.arcTo(x, y + h, x, y + h - bl, bl);
    ctx.lineTo(x, y + tl);
    if (tl > 0)
        ctx.arcTo(x, y, x + tl, y, tl);
    ctx.closePath();
}
// ---- 图片缓存：uri → 已解码图像；未就绪时先留白，加载完触发重绘 ----
const imageCache = new Map();
// 自绘图表烘的离屏位图（合成 key 'sparkline:*'）：独立小表，不参与按字节 LRU 淘汰，
// 由组件卸载时 dropCachedCanvas 显式回收；与 uri 缓存互不影响。
const customBitmaps = new Map();
const pendingImages = new Set();
const failedImages = new Set();
/** 图片加载完成计数：烘好的位图若含当时未就绪的图，图到位后需重烘（gen 变化→缓存失效） */
let imageGen = 0;
/** 图片解码完成后由 renderer 注入，用于请求下一帧 */
let onImageReady = null;
function setImageReadyNotifier(fn) {
    onImageReady = fn;
}
/** 图片解码缓存字节上限：解码位图 ≈ 宽×高×4，只增不减会把 External 内存一路推高（同 canvas.data() 峰值一类压力源）。
 * 照本文件 pathCache 的 LRU 范式按字节封顶淘汰。上限可用 FLUX_IMG_CACHE_MB 覆盖（默认 192MB）。 */
const IMG_CACHE_MAX_BYTES = (Number(process.env.FLUX_IMG_CACHE_MB) || 192) * 1024 * 1024;
let imgCacheBytes = 0;
/** 估算单张解码位图占用（字节）：@napi-rs/canvas Image 暴露 width/height，RGBA 每像素 4 字节 */
function imgBytes(img) {
    return (img?.width ?? 0) * (img?.height ?? 0) * 4;
}
function getImage(uri) {
    const cb = customBitmaps.get(uri);
    if (cb)
        return cb; // 合成离屏位图（自绘图表），直接命中，永不走磁盘加载
    // 合成 key（'fluxcanvas:'/'sparkline:'）首帧 effect 烘图前尚未入表：直接返回 null（留白），绝不去磁盘/网络加载这个不存在的 uri
    if (uri.startsWith('fluxcanvas:') || uri.startsWith('sparkline:'))
        return null;
    const hit = imageCache.get(uri);
    if (hit) {
        // touch：delete+set 移到队尾（最近使用）。paintImage 每帧对屏内图调 getImage，
        // 故屏内图恒在队尾、队首永远是离屏图 → 下面的淘汰只会逐出看不见的，屏内不误删。
        imageCache.delete(uri);
        imageCache.set(uri, hit);
        return hit;
    }
    if (pendingImages.has(uri) || failedImages.has(uri))
        return null;
    pendingImages.add(uri);
    (0, canvas_1.loadImage)(uri)
        .then((img) => {
        imageCache.set(uri, img);
        imgCacheBytes += imgBytes(img);
        pendingImages.delete(uri);
        // 超顶从队首淘汰（Map 迭代序=插入序，队首=最久未用）；size<=1 守卫：
        // 单张图就超顶时也至少留住它自己，避免把它立刻逐出的自删抖动。
        for (const k of imageCache.keys()) {
            if (imgCacheBytes <= IMG_CACHE_MAX_BYTES || imageCache.size <= 1)
                break;
            imgCacheBytes -= imgBytes(imageCache.get(k));
            imageCache.delete(k);
        }
        imageGen++;
        onImageReady && onImageReady();
    })
        .catch((e) => {
        pendingImages.delete(uri);
        failedImages.add(uri);
        console.warn('[flux-skia] image load failed: ' + uri + ' \u2014 ' + e.message);
    });
    return null;
}
/**
 * 预加载：提前触发图片解码入缓存，供后续 Image 节点渲染时直接命中，避免首帧留白。
 * 常用于轮播/标签页等「下一屏即将出现」的场景，在当前帧空闲时预热未来资源。
 * 已缓存 / 加载中 / 曾失败的 uri 会被 getImage 内部去重，重复调用无副作用。
 */
function preloadImage(uri) {
    if (uri)
        getImage(uri);
}
/** 批量预加载。 */
function preloadImages(uris) {
    for (const u of uris)
        preloadImage(u);
}
/** 图片是否已解码入缓存（可用于判断能否无留白直接展示）。 */
function isImageReady(uri) {
    return !!uri && imageCache.has(uri);
}
/** 取当前生效的绘制 dpr（离屏 canvas 按设备像素建才不发虚）。首帧 paintTree 前为默认 1。 */
function getPaintDpr() {
    return paintDpr || 1;
}
/** 把一张现画好的 canvas 塞进 customBitmaps，供单个 image 节点（source=合成 key）直接显示；imageGen++ 令含它的位图缓存子树重烘，并请求下一帧。 */
function putCachedCanvas(uri, canvas) {
    customBitmaps.set(uri, canvas);
    imageGen++;
    onImageReady && onImageReady();
}
/** 组件卸载时回收合成位图（customBitmaps 不走 LRU，必须显式删）。 */
function dropCachedCanvas(uri) {
    if (customBitmaps.delete(uri))
        imageGen++;
}
/** 图片解码缓存占用（条数 / 估算字节 / 上限字节），供内存面板与帧日志观测 LRU 是否生效。 */
function imageCacheStats() {
    return { count: imageCache.size + customBitmaps.size, bytes: imgCacheBytes, maxBytes: IMG_CACHE_MAX_BYTES };
}
// ---- 显示尺寸降采样：源图远大于显示框时，缩到「框×dpr（含余量）」再回写缓存 ----
// 动机：shot-theme.png 5137×1440 解码 28MB 却显示在 ~210px 高的框里 → 白存 ~48× 像素；
// 首页 14 图全分辨率解码 ≈ 95MB，降采样后可压到 ~25MB。env FLUX_IMG_DS=0 关闭（对比/回退）。
const DS_ON = process.env.FLUX_IMG_DS !== '0';
const DS_HEADROOM = 1.3; // 目标尺寸留 30% 余量，吸收响应式小幅增长，避免频繁重载
const DS_TRIGGER = 1.8; // 源图最大边 > 需求最大边 × 此倍数才降（小幅超出直接画，省一次缩放与缓存抖动）
// 记录已降采样过的 uri 的原图尺寸（原图已被小图替换掉，靠此判断；当前版本不做“框变大重载”，仅作观测）
const origSize = new Map();
/** 把 src 等比缩到 tw×th 画进离屏 canvas（高质量重采样），返回可作 drawImage 源的 Canvas。 */
function downscaleImage(src, tw, th) {
    const c = (0, canvas_1.createCanvas)(Math.max(1, tw), Math.max(1, th));
    const cx = c.getContext('2d');
    cx.imageSmoothingEnabled = true;
    try {
        cx.imageSmoothingQuality = 'high';
    }
    catch { /* 旧版无此属性 */ }
    cx.drawImage(src, 0, 0, c.width, c.height);
    return c;
}
/** 用 newBmp 替换 uri 的缓存位图，同步 imgCacheBytes 并按字节上限 LRU 淘汰（newBmp 置于队尾）。 */
function replaceCachedImage(uri, newBmp) {
    const old = imageCache.get(uri);
    if (old)
        imgCacheBytes -= imgBytes(old);
    imageCache.delete(uri);
    imageCache.set(uri, newBmp);
    imgCacheBytes += imgBytes(newBmp);
    for (const k of imageCache.keys()) {
        if (imgCacheBytes <= IMG_CACHE_MAX_BYTES || imageCache.size <= 1)
            break;
        imgCacheBytes -= imgBytes(imageCache.get(k));
        imageCache.delete(k);
    }
}
// ---- 默认文字/图标色：裸 Text（未显式 color）的兜底，由 FluxProvider 随主题同步 ----
// 坑：此处曾硬编码 '#000'，暗色主题下所有不带 color 的 Text 黑字压深底几乎不可见
let defaultTextColor = '#000';
function setDefaultTextColor(color) {
    defaultTextColor = color;
}
/** 内容盒（去掉 border + padding），文字与子节点定位都相对它 */
function contentBox(node, x, y) {
    const s = node.style;
    const bw = (0, flatten_1.getBorderWidths)(s);
    const left = bw.left + (0, flatten_1.toNumber)(s.paddingLeft);
    const top = bw.top + (0, flatten_1.toNumber)(s.paddingTop);
    const right = bw.right + (0, flatten_1.toNumber)(s.paddingRight);
    const bottom = bw.bottom + (0, flatten_1.toNumber)(s.paddingBottom);
    return {
        x: x + left,
        y: y + top,
        w: Math.max(0, node.w - left - right),
        h: Math.max(0, node.h - top - bottom),
    };
}
/** 逐条边填充：用于单边 / 四边不等宽的边框（Card 头尾分隔线就是这种） */
function fillBorderBands(ctx, x, y, w, h, bw, bc) {
    if (bw.top > 0 && bc.top) {
        ctx.fillStyle = String(bc.top);
        ctx.fillRect(x, y, w, bw.top);
    }
    if (bw.bottom > 0 && bc.bottom) {
        ctx.fillStyle = String(bc.bottom);
        ctx.fillRect(x, y + h - bw.bottom, w, bw.bottom);
    }
    if (bw.left > 0 && bc.left) {
        ctx.fillStyle = String(bc.left);
        ctx.fillRect(x, y, bw.left, h);
    }
    if (bw.right > 0 && bc.right) {
        ctx.fillStyle = String(bc.right);
        ctx.fillRect(x + w - bw.right, y, bw.right, h);
    }
}
function paintBackground(ctx, node, x, y) {
    const s = node.style;
    const w = node.w;
    const h = node.h;
    if (w <= 0 || h <= 0)
        return;
    const r = (0, flatten_1.getRadius)(s);
    const hasRadius = r.tl || r.tr || r.br || r.bl;
    const bg = s.backgroundColor;
    const bw = (0, flatten_1.getBorderWidths)(s);
    const borderW = Math.max(bw.top, bw.right, bw.bottom, bw.left);
    // 阴影只作用于背景层，画完立刻清掉，避免污染子节点
    if (s.shadowColor && (s.shadowRadius || s.shadowOffset)) {
        ctx.save();
        ctx.shadowColor = String(s.shadowColor);
        ctx.shadowBlur = (0, flatten_1.toNumber)(s.shadowRadius);
        ctx.shadowOffsetX = (0, flatten_1.toNumber)(s.shadowOffset && s.shadowOffset.width);
        ctx.shadowOffsetY = (0, flatten_1.toNumber)(s.shadowOffset && s.shadowOffset.height);
        roundRectPath(ctx, x, y, w, h, r);
        ctx.fillStyle = bg || 'transparent';
        if (bg)
            ctx.fill();
        ctx.restore();
    }
    if (bg) {
        roundRectPath(ctx, x, y, w, h, r);
        ctx.fillStyle = String(bg);
        ctx.fill();
    }
    const bc = (0, flatten_1.getBorderColors)(s);
    const uniform = bw.top === bw.right && bw.right === bw.bottom && bw.bottom === bw.left;
    if (borderW > 0 && s.borderStyle !== 'none') {
        if (uniform && (s.borderStyle === 'dashed' || s.borderStyle === 'dotted')) {
            ctx.save();
            ctx.strokeStyle = String(bc.top ?? bc.left ?? defaultTextColor);
            ctx.lineWidth = borderW;
            ctx.setLineDash(s.borderStyle === 'dashed' ? [borderW * 2, borderW * 1.5] : [borderW, borderW]);
            roundRectPath(ctx, x + borderW / 2, y + borderW / 2, w - borderW, h - borderW, r);
            ctx.stroke();
            ctx.restore();
        }
        else if (uniform && hasRadius) {
            // 描边路径内缩半个线宽，使 lineWidth 恰好压在 border box 上（与 CSS 一致）
            ctx.save();
            ctx.strokeStyle = String(bc.top ?? bc.left ?? defaultTextColor);
            ctx.lineWidth = borderW;
            roundRectPath(ctx, x + borderW / 2, y + borderW / 2, w - borderW, h - borderW, r);
            ctx.stroke();
            ctx.restore();
        }
        else {
            // 不等宽：先按圆角外框裁剪，再逐条边填，避免直角矩形压出圆角外的毛刺
            ctx.save();
            roundRectPath(ctx, x, y, w, h, r);
            ctx.clip();
            fillBorderBands(ctx, x, y, w, h, bw, bc);
            ctx.restore();
        }
    }
}
function paintText(ctx, node, x, y) {
    const s = node.style;
    const box = contentBox(node, x, y);
    if (!node.text || box.w <= 0 || box.h <= 0)
        return;
    const maxLines = node.props.numberOfLines ? Number(node.props.numberOfLines) : undefined;
    const layout = (0, textLayout_1.layoutText)(node.text, s, box.w, maxLines, !!node.props.preserveTrailingSpace);
    ctx.save();
    // 绕盒子中心旋转（度）：Watermark 等场景用，布局盒不变、只转绘制
    const rotate = Number(node.props.rotate) || 0;
    if (rotate) {
        ctx.translate(box.x + box.w / 2, box.y + box.h / 2);
        ctx.rotate((rotate * Math.PI) / 180);
        ctx.translate(-(box.x + box.w / 2), -(box.y + box.h / 2));
    }
    ctx.font = (0, fonts_1.fontShorthand)(s);
    ctx.fillStyle = String(s.color ?? defaultTextColor);
    ctx.textBaseline = 'middle';
    const fontSize = Number(s.fontSize) || 14;
    const align = s.textAlign ?? 'left';
    const deco = s.textDecorationLine;
    layout.lines.forEach((line, i) => {
        let lx = box.x;
        if (align === 'center')
            lx = box.x + (box.w - line.width) / 2;
        else if (align === 'right' || align === 'justify')
            lx = box.x + (box.w - line.width);
        const ly = box.y + i * layout.lineHeight + layout.lineHeight / 2;
        ctx.fillText(line.text, lx, ly);
        if (deco && deco !== 'none') {
            const lh = Math.max(1, fontSize / 12);
            const d = String(deco);
            // baseline 为 middle，ly 即文字垂直中心：下划线落在基线下方，删除线穿过中部
            if (d.indexOf('underline') >= 0)
                ctx.fillRect(lx, ly + fontSize * 0.42, line.width, lh);
            if (d.indexOf('line-through') >= 0)
                ctx.fillRect(lx, ly - fontSize * 0.06, line.width, lh);
        }
    });
    ctx.restore();
}
function paintImage(ctx, node, x, y) {
    const src = node.props.source;
    const uri = typeof src === 'string' ? src : src && src.uri;
    if (!uri)
        return;
    const img0 = getImage(uri);
    if (!img0)
        return;
    const box = contentBox(node, x, y);
    if (box.w <= 0 || box.h <= 0)
        return;
    let img = img0;
    // 显示尺寸降采样：源最大边远大于本框显示所需（最大边×dpr）时，等比缩到「需求×余量」替换回缓存，
    // 砍掉 shot-theme(5137×1440→28MB) 这类巨图的浪费。env FLUX_IMG_DS=0 关闭。
    if (DS_ON) {
        const dpr = paintDpr || 1;
        const need = Math.max(box.w, box.h) * dpr;
        const srcMax = Math.max(img.width, img.height);
        if (srcMax > need * DS_TRIGGER) {
            const s = (need * DS_HEADROOM) / srcMax; // < 1
            const tw = Math.round(img.width * s);
            const th = Math.round(img.height * s);
            if (!origSize.has(uri))
                origSize.set(uri, { w: img.width, h: img.height });
            const scaled = downscaleImage(img, tw, th);
            replaceCachedImage(uri, scaled);
            img = scaled;
        }
    }
    const iw = img.width;
    const ih = img.height;
    const mode = node.props.resizeMode ?? 'cover';
    ctx.save();
    const r = (0, flatten_1.getRadius)(node.style);
    if (r.tl || r.tr || r.br || r.bl) {
        roundRectPath(ctx, box.x, box.y, box.w, box.h, r);
        ctx.clip();
    }
    let dw = box.w;
    let dh = box.h;
    let dx = box.x;
    let dy = box.y;
    if (mode === 'contain') {
        const k = Math.min(box.w / iw, box.h / ih);
        dw = iw * k;
        dh = ih * k;
        dx += (box.w - dw) / 2;
        dy += (box.h - dh) / 2;
    }
    else if (mode === 'cover') {
        const k = Math.max(box.w / iw, box.h / ih);
        dw = iw * k;
        dh = ih * k;
        dx -= (dw - box.w) / 2;
        dy -= (dh - box.h) / 2;
    }
    else if (mode === 'center') {
        dw = iw;
        dh = ih;
        dx = box.x + (box.w - iw) / 2;
        dy = box.y + (box.h - ih) / 2;
    }
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
}
// 视频帧：从帧槽注册表取解码器写入的当前帧（一个 @napi-rs/canvas 位图），按与图片同样的缩放贴合盒子。
// 与 paintImage 唯一区别：源不是 uri 缓存而是 node.props.videoId 对应的活帧；未就绪则画占位深底。
function paintVideo(ctx, node, x, y) {
    const id = node.props.videoId;
    const box = contentBox(node, x, y);
    if (box.w <= 0 || box.h <= 0)
        return;
    const slot = typeof id === 'number' ? (0, registry_1.peekFrame)(id) : null;
    ctx.save();
    const r = (0, flatten_1.getRadius)(node.style);
    if (r.tl || r.tr || r.br || r.bl) {
        roundRectPath(ctx, box.x, box.y, box.w, box.h, r);
        ctx.clip();
    }
    if (!slot || !slot.ready) {
        ctx.fillStyle = '#0b0b0b';
        ctx.fillRect(box.x, box.y, box.w, box.h);
        ctx.restore();
        return;
    }
    const iw = slot.width;
    const ih = slot.height;
    const mode = node.props.resizeMode ?? 'contain';
    let dw = box.w;
    let dh = box.h;
    let dx = box.x;
    let dy = box.y;
    if (mode === 'contain') {
        const k = Math.min(box.w / iw, box.h / ih);
        dw = iw * k;
        dh = ih * k;
        dx += (box.w - dw) / 2;
        dy += (box.h - dh) / 2;
    }
    else if (mode === 'cover') {
        const k = Math.max(box.w / iw, box.h / ih);
        dw = iw * k;
        dh = ih * k;
        dx -= (dw - box.w) / 2;
        dy -= (dh - box.h) / 2;
    }
    else if (mode === 'center') {
        dw = iw;
        dh = ih;
        dx = box.x + (box.w - iw) / 2;
        dy = box.y + (box.h - ih) / 2;
    }
    ctx.drawImage(slot.canvas, dx, dy, dw, dh);
    ctx.restore();
}
// ---- 图标矢量层：SVG path → Path2D，按 viewBox 等比缩放居中绘制 ----
// 同一 d 的 Path2D 只构建一次（解析 path data 相对昂贵），后续帧直接复用。
// 命中即移到队尾（LRU），超过上限从队首淘汰——防止 Progress 圆弧等「逐帧变化的 d」无限增长内存。
const PATH_CACHE_MAX = 1024;
const pathCache = new Map();
function getPath(d) {
    let p = pathCache.get(d);
    if (p) {
        pathCache.delete(d);
        pathCache.set(d, p);
        return p;
    }
    p = new canvas_1.Path2D(d);
    pathCache.set(d, p);
    if (pathCache.size > PATH_CACHE_MAX) {
        const oldest = pathCache.keys().next().value;
        if (oldest !== undefined)
            pathCache.delete(oldest);
    }
    return p;
}
function paintIcon(ctx, node, x, y) {
    const d = node.props.d;
    if (!d)
        return;
    const box = contentBox(node, x, y);
    if (box.w <= 0 || box.h <= 0)
        return;
    const vb = Number(node.props.vb) > 0 ? Number(node.props.vb) : 24;
    const side = Math.min(box.w, box.h);
    const scale = side / vb;
    const dx = box.x + (box.w - side) / 2;
    const dy = box.y + (box.h - side) / 2;
    const color = String(node.props.color ?? defaultTextColor);
    const mode = node.props.mode === 'fill' ? 'fill' : 'stroke';
    ctx.save();
    ctx.translate(dx, dy);
    ctx.scale(scale, scale);
    const rot = Number(node.props.rotate) || 0;
    if (rot) {
        // 绕 viewBox 中心旋转（供 Spin 等动画使用）
        ctx.translate(vb / 2, vb / 2);
        ctx.rotate((rot * Math.PI) / 180);
        ctx.translate(-vb / 2, -vb / 2);
    }
    // GPU 模式无 Path2D：直传 SVG path data 字符串（proxy 识别字符串后走 fillSvgPath/strokeSvgPath）。
    const path = ctx.__gpu ? d : getPath(d);
    if (mode === 'fill') {
        ctx.fillStyle = color;
        // evenodd：内层子路径自动镂空，让「实心圆 + 符号」类 filled 图标正确显形（如 checkCircle-filled）
        ctx.fill(path, 'evenodd');
    }
    else {
        ctx.strokeStyle = color;
        ctx.lineWidth = Number(node.props.strokeWidth) > 0 ? Number(node.props.strokeWidth) : 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke(path);
    }
    ctx.restore();
}
/** 有效 z-index：未设或非法值视为 0（普通文档流）。>0 视为需提升到顶层的浮层。 */
function zIndexOf(node) {
    const z = node.style.zIndex;
    if (z == null)
        return 0;
    const n = Number(z);
    return Number.isFinite(n) ? n : 0;
}
// ---- 离屏位图缓存（静态子树）----
// 主画布当前的物理/逻辑比（由 paintTree 入口设定），供离屏 canvas 按设备分辨率建。
let paintDpr = 1;
// 正在烘一张位图（递归重绘子树时置 true）：内部不再走缓存，避免自指无限递归。
let baking = false;
// 诊断计数（FLUX_DEBUG 下按帧输出 bake/hit）：hit 主导 = 滚动/静止期大量复用缓存，bake 仅在内容真变时发生
let bmBake = 0;
let bmHit = 0;
function bitmapStats() {
    const s = { bake: bmBake, hit: bmHit };
    bmBake = 0;
    bmHit = 0;
    return s;
}
/** 是否可安全地把本节点整棵子树平铺成一张位图缓存。 */
function canCache(node) {
    if (baking)
        return false;
    if (node.style.cacheAsBitmap !== true)
        return false; // 显式 opt-in（动画/live 区不打此标→不缓存）
    if (!node.__noOverlay)
        return false; // 子树含 zIndex>0 浮层：会被延迟到顶层另绘，烘进位图会丢/重（子节点 transform 无害，已烘）
    const tf = node.style.transform;
    if (Array.isArray(tf) && tf.length > 0)
        return false; // 节点自身 transform 无法经 blit 复现（会被烘一次又在 blit 丢）
    if (node.kind === 'scroll')
        return false; // 滚动内容每帧位移，不可整块缓存
    if (node.style.overflow !== 'hidden')
        return false; // 仅当自身盒即裁剪边界，平铺到盒尺寸才与直绘等价
    if (node.style.shadowColor)
        return false; // 阴影逸出盒外，会被盒尺寸位图裁掉
    const w = node.w;
    const h = node.h;
    if (w <= 0 || h <= 0)
        return false;
    const dpr = paintDpr || 1;
    if (w * dpr > 4096 || h * dpr > 4096)
        return false; // 尺寸上限，护内存
    return true;
}
/** 命中则把子树烘一次到离屏 canvas 存于 node.__bm，此后每帧只 drawImage（位置可随滚动变，内容不变则复用）。 */
function paintCached(ctx, node, x, y, inheritedAlpha) {
    const dpr = paintDpr || 1;
    const epoch = node.__mutEpoch || 0;
    let bm = node.__bm;
    const stale = !bm || bm.w !== node.w || bm.h !== node.h || bm.epoch !== epoch || bm.gen !== imageGen;
    if (stale)
        bmBake++;
    else
        bmHit++;
    if (stale) {
        if (!bm || bm.w !== node.w || bm.h !== node.h) {
            const off = (0, canvas_1.createCanvas)(Math.max(1, Math.round(node.w * dpr)), Math.max(1, Math.round(node.h * dpr)));
            bm = { canvas: off, ctx: off.getContext('2d'), w: node.w, h: node.h, epoch: 0, gen: 0 };
            node.__bm = bm;
        }
        const oc = bm.ctx;
        oc.setTransform(1, 0, 0, 1, 0, 0);
        oc.clearRect(0, 0, bm.canvas.width, bm.canvas.height);
        oc.setTransform(dpr, 0, 0, dpr, 0, 0);
        baking = true;
        try {
            // 以节点本地原点重绘整棵子树（ox/oy 使 x/y=0），alpha=1；祖先 alpha 在贴回时乘（节点自身 opacity 已 bake）
            paintNode(oc, node, -node.x, -node.y, 1, null, null);
        }
        finally {
            baking = false;
        }
        bm.epoch = epoch;
        bm.gen = imageGen;
    }
    if (!bm)
        return; // stale 块后 bm 必已就位（!bm 会令 stale=true→重建）；此行为满 TS 窄化
    ctx.save();
    ctx.globalAlpha = inheritedAlpha;
    ctx.drawImage(bm.canvas, 0, 0, bm.canvas.width, bm.canvas.height, x, y, node.w, node.h);
    ctx.restore();
}
function paintNode(ctx, node, ox, oy, inheritedAlpha, overlays, band = null) {
    if (!node.visible || node.style.display === 'none')
        return;
    const x = ox + node.x;
    const y = oy + node.y;
    // 视口剔除：处于某裁剪带内、子树干净（无浮层/transform）、且自身绘制盒完全落在带外
    // （留半屏缓冲防绝对定位子节点逸出）→ 整块跳过，省掉其子树的绘制记录与 Skia 光栅化。
    // 长页面滚动的每帧主成本在此：data() 会触发 Skia 把被裁剪的离屏内容也光栅化（实测随内容涨）。
    if (band && node.__cullClean) {
        const mx = (band.x1 - band.x0) * 0.5;
        const my = (band.y1 - band.y0) * 0.5;
        if (x + node.w < band.x0 - mx || x > band.x1 + mx || y + node.h < band.y0 - my || y > band.y1 + my) {
            return;
        }
    }
    const alpha = inheritedAlpha * (node.style.opacity === undefined ? 1 : (0, flatten_1.toNumber)(node.style.opacity, 1));
    // z-index 浮层提升：基线趟遇到 zIndex>0 的节点，先登记、整棵子树跳过，留到主树之后重画到最上层。
    // （复刻 CSS「定位元素晚于静态内容绘制」——下拉面板不再被后续兄弟块遮挡。）
    // 浮层重绘走根 ctx（不继承祖先 clip/transform）：正是面板要溢出小容器的语义；命中测试吃 ax/ay 不受影响。
    if (overlays && zIndexOf(node) > 0) {
        overlays.push({ node, ox, oy, alpha: inheritedAlpha });
        return;
    }
    // 离屏位图缓存：命中的静态重子树只烘一次、之后每帧 drawImage，省掉重复的 Skia 指令记录与 data() 光栅化
    if (canCache(node)) {
        paintCached(ctx, node, x, y, inheritedAlpha);
        return;
    }
    ctx.save();
    ctx.globalAlpha = alpha;
    // 绘制期 2D 变换：施加到 ctx 变换栈，本节点与其整棵子树的绘制都会被带着走（复刻 CSS 父 transform 作用于后代）。
    // 矩阵已按绝对盒原点做 T(O)·P·T(-O)，故子节点用绝对坐标绘制时天然一致；单位矩阵 parseTransform 返回 null 走快速路径。
    const m = (0, flatten_1.parseTransform)(node.style, node.w, node.h, x, y);
    if (m)
        ctx.transform(m.a, m.b, m.c, m.d, m.e, m.f);
    paintBackground(ctx, node, x, y);
    if (node.kind === 'text')
        paintText(ctx, node, x, y);
    if (node.kind === 'image')
        paintImage(ctx, node, x, y);
    if (node.kind === 'video')
        paintVideo(ctx, node, x, y);
    if (node.kind === 'icon')
        paintIcon(ctx, node, x, y);
    // overflow:'hidden' 与滚动容器都用自身圆角矩形裁剪子节点（RN 语义）
    const isScroll = node.kind === 'scroll';
    const isClip = isScroll || node.style.overflow === 'hidden';
    if (isClip) {
        ctx.save();
        roundRectPath(ctx, x, y, node.w, node.h, (0, flatten_1.getRadius)(node.style));
        ctx.clip();
    }
    // 新的裁剪带 = 传入带 ∩ 本裁剪节点的绘制盒（子节点按滚动偏移绘制，剔除时与带比较已含该偏移）；
    // 非裁剪节点沿用祖先带，使剔除能穿透 wrapper 深入到其内部各行。
    // ⚠️ 必须求交而非替换：host 滚动条带缓存的补画趟会从视口处传入窄带，
    //    若被替换回整个视口盒，补画趟就失去收紧意义（band 为 null 时退化为自身盒，与旧行为等价）。
    let childBand = band;
    if (isClip) {
        const box = { x0: x, y0: y, x1: x + node.w, y1: y + node.h };
        childBand = band
            ? {
                x0: Math.max(band.x0, box.x0),
                y0: Math.max(band.y0, box.y0),
                x1: Math.min(band.x1, box.x1),
                y1: Math.min(band.y1, box.y1),
            }
            : box;
    }
    const cx = isScroll ? x - node.scrollX : x;
    const cy = isScroll ? y - node.scrollY : y;
    for (const child of node.children)
        paintNode(ctx, child, cx, cy, alpha, overlays, childBand);
    if (isClip) {
        if (isScroll)
            paintScrollBar(ctx, node, x, y);
        ctx.restore();
    }
    ctx.restore();
}
/** 滚动条：仅在内容真的溢出时画一条细胶囊，不抢事件也不参与布局 */
function paintScrollBar(ctx, node, x, y) {
    const content = (0, node_1.scrollContentSize)(node);
    const vertical = content.h > node.h + 0.5;
    const horizontal = content.w > node.w + 0.5;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    const T = 4;
    if (vertical) {
        const track = node.h - (0, flatten_1.toNumber)(node.style.paddingTop) - (0, flatten_1.toNumber)(node.style.paddingBottom);
        const thumb = Math.max(24, (node.h / content.h) * track);
        const travel = Math.max(0, track - thumb);
        const max = Math.max(1, content.h - node.h);
        const top = y + (0, flatten_1.toNumber)(node.style.paddingTop) + travel * Math.min(1, node.scrollY / max);
        roundRectPath(ctx, x + node.w - T - 2, top, T, thumb, { tl: T / 2, tr: T / 2, bl: T / 2, br: T / 2 });
        ctx.fill();
    }
    if (horizontal && !vertical) {
        const track = node.w - (0, flatten_1.toNumber)(node.style.paddingLeft) - (0, flatten_1.toNumber)(node.style.paddingRight);
        const thumb = Math.max(24, (node.w / content.w) * track);
        const travel = Math.max(0, track - thumb);
        const max = Math.max(1, content.w - node.w);
        const left = x + (0, flatten_1.toNumber)(node.style.paddingLeft) + travel * Math.min(1, node.scrollX / max);
        roundRectPath(ctx, left, y + node.h - T - 2, thumb, T, { tl: T / 2, tr: T / 2, bl: T / 2, br: T / 2 });
        ctx.fill();
    }
    ctx.restore();
}
/** 图片是否仍在解码中（host 滚动条带缓存据此拒绝增量帧：新图到位必须整帧重画） */
function imagesPending() {
    return pendingImages.size > 0;
}
/** 已就绪图片计数（每次解码完成 +1）：host 空闲跳帧门比对这个基线，识别「本窗不是 setImageReadyNotifier 单例的宿主、
 *  但期间有别的窗触发了图片解码」的场景——否则空闲窗会跳过那一帧，新图所在区域停留在占位底图像素（横条元素呈一条横线残影）。
 *  onImageReady 是全局单例（后建的窗覆盖先建的），只有最后一扇窗能吃到 extDirty=true，其余窗必须靠这个 counter 兜住。*/
function getImageGen() {
    return imageGen;
}
function paintTree(ctx, root, dpr = 1, opts) {
    paintDpr = dpr;
    if (!opts?.noClear)
        ctx.clearRect(0, 0, root.w, root.h);
    const overlays = [];
    const band = opts?.band ?? null;
    // 第一趟：画普通内容，顺带收集所有 zIndex>0 的浮层（其子树跳过）
    for (const child of root.children)
        paintNode(ctx, child, 0, 0, 1, overlays, band);
    // 第二趟：按 zIndex 升序（稳定排序→同值保持文档序）把浮层连同子树重画到最上层
    overlays.sort((a, b) => zIndexOf(a.node) - zIndexOf(b.node));
    for (const o of overlays)
        paintNode(ctx, o.node, o.ox, o.oy, o.alpha, null, band);
}
/** 创建一张 W×H（物理像素）的画布，返回 ctx 且已按 dpr 缩放到逻辑坐标系 */
function createSurface(width, height, dpr) {
    const canvas = (0, canvas_1.createCanvas)(Math.max(1, Math.round(width * dpr)), Math.max(1, Math.round(height * dpr)));
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { canvas, ctx };
}
