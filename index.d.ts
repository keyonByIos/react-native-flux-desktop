

export declare function clipboardText(): string

export declare function setClipboardText(text: string): boolean

export declare function releaseGpuImage(id: number): void

export declare function kvOpen(name: string, path: string): void
export declare function kvIsOpen(name: string): boolean
export declare function kvClose(name: string): void

export declare function kvPut(name: string, key: string, value: Buffer): void

export declare function kvGet(name: string, key: string): Buffer | null
export declare function kvHas(name: string, key: string): boolean
export declare function kvDel(name: string, key: string): boolean
export declare function kvKeys(name: string): Array<string>

export declare function kvCompact(name: string): void

export declare function armWatch(rectX: number, rectY: number, rectW: number, rectH: number, onDismiss: (...args: any[]) => any): void

export declare function disarmWatch(): void

export declare function presentGpu(id: number, buf: Buffer, srcW: number, srcH: number): void

export declare function present(id: number, buf: Buffer, srcW: number, srcH: number): void

export declare function setBackground(id: number, r: number, g: number, b: number): void

export declare function pump(): boolean

export declare function createTray(onEvent: (...args: any[]) => any, iconRgba: Buffer, w: number, h: number, tooltip: string): void

export declare function setTrayIcon(iconRgba: Buffer, w: number, h: number): void

export declare function setTrayTooltip(text: string): void

export declare function removeTray(): void

export declare function createWindow(width: number, height: number, title: string, x: number | undefined | null, y: number | undefined | null, onTop: boolean | undefined | null, decorations: boolean | undefined | null, transparent: boolean | undefined | null, maximized: boolean | undefined | null, onEvent: (...args: any[]) => any): number

export declare function closeWindow(id: number): boolean

export declare function setWindowIcon(id: number, rgba: Buffer, width: number, height: number): void

export declare function setAppUserModelId(id: string): void

export declare function setCursor(id: number, shape: string): void

export declare function setTitle(id: number, title: string): void

export declare function setResizable(id: number, resizable: boolean): void

export declare function isResizable(id: number): boolean

export declare function setMinSize(id: number, width?: number | undefined | null, height?: number | undefined | null): void

export declare function setMaxSize(id: number, width?: number | undefined | null, height?: number | undefined | null): void

export declare function setSize(id: number, width: number, height: number): void

export declare function getInnerSize(id: number): Array<number>

export declare function setDecorations(id: number, decorations: boolean): void

export declare function isDecorated(id: number): boolean

export declare function setMaximized(id: number, maximized: boolean): void

export declare function isMaximized(id: number): boolean

export declare function setMinimized(id: number, minimized: boolean): void

export declare function focusWindow(id: number): void

export declare function centerWindow(id: number): void

export declare function setWindowPosition(id: number, x: number, y: number): void

export declare function getMonitorSize(id: number): Array<number>

export declare function getOuterPosition(id: number): Array<number>

export declare function getScale(id: number): number
export declare function version(): string
export type NapiGpuImage = GpuImage

export declare class GpuImage {
  id: number
  constructor(width: number, height: number, rgba: Buffer)
}
export type NapiGpuCtx2D = GpuCtx2D

export declare class GpuCtx2D {
  constructor(id: number)
  set fillStyle(val: string)
  set strokeStyle(val: string)
  set lineWidth(val: number)
  set globalAlpha(val: number)
  set lineCap(val: string)
  set lineJoin(val: string)
  setLineDash(segments: Array<number>): void
  save(): void
  restore(): void
  translate(x: number, y: number): void
  scale(sx: number, sy: number): void
  rotate(angle: number): void
  resetTransform(): void
  setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void

  transform(a: number, b: number, c: number, d: number, e: number, f: number): void
  fillRect(x: number, y: number, w: number, h: number): void
  strokeRect(x: number, y: number, w: number, h: number): void
  clearRect(x: number, y: number, w: number, h: number): void
  beginPath(): void
  moveTo(x: number, y: number): void
  lineTo(x: number, y: number): void
  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean | undefined | null): void
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void
  bezierCurveTo(cp1X: number, cp1Y: number, cp2X: number, cp2Y: number, x: number, y: number): void
  closePath(): void
  fill(): void
  stroke(): void
  clip(): void
  fillSvgPath(d: string, evenOdd: boolean): void
  strokeSvgPath(d: string): void
  set font(val: string)
  setTextBaseline(val: string): void
  fillText(text: string, x: number, y: number): void
  strokeText(text: string, x: number, y: number): void
  measureText(text: string): number
  drawImage(imgId: number, dx: number, dy: number, dw?: number | undefined | null, dh?: number | undefined | null): void

  flush(): void

  cacheBytes(): number

  clearAll(r: number, g: number, b: number, a: number): void
}
