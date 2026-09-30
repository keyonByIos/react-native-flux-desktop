"use strict";
// PlatformWindow —— 窗口平台的抽象契约。把「窗口层」与上层编排（布局/绘制/命中/事件语义/dpr）解耦：
// host 只认这个接口，具体实现可以是自研底座（WinitWindow），将来也可回退 Qt 或换别的壳。
//
// 坐标系约定：所有对外事件与几何都用「逻辑坐标」（与 Yoga 布局、hitTest 同一坐标系，内部已 ÷scale 归一）。
// present 收上层产出的任意尺寸画布（逻辑×renderScale），由实现层缩放铺到物理帧缓冲。
Object.defineProperty(exports, "__esModule", { value: true });
