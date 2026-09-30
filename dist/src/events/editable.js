"use strict";
// 文本输入控制契约：可编辑字段（Input / TextArea 等）把它挂到自己场景节点的 __input 上。
// host 的命中/键盘/IME 事件据此路由到当前聚焦字段，无需 React ref 链穿透到窗口层。
// 这里只放纯类型，不 import 任何模块，避免与 scene/host 形成循环依赖。
Object.defineProperty(exports, "__esModule", { value: true });
