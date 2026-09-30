"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndentedTree = IndentedTree;
// IndentedTree：缩进树。根在顶部，子节点逐层缩进、纵向排列，L 形连线连接父子。
// 5 种展示模式通过 props 组合：
//   - side='right'|'left'：子节点在右（默认）或左（镜像）
//   - nodeStyle='filled'|'line'|'box'：蓝底圆角 / 纯文字 / 描边框
//   - collapsible=true：点击节点展开/收起子树
// 布局：DFS 前序给每个可见节点分配行号；x = depth * indent；y = row * rowHeight。
// 连线（肘形）：父底部中心 → 短竖 → 水平移到干线 x（子列左侧槽位内）→ 竖到各子中心 y → 水平进子左缘。
// 干线落在“父列与子列之间的槽位”而非节点框内，避免竖线穿过任何节点文字。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const common_1 = require("../core/common");
/** DFS 前序展开可见节点（折叠节点不展开其子）。 */
function flatten(root, collapsed) {
    const out = [];
    let row = 0;
    const walk = (n, depth, parentId, branch) => {
        const id = n.id ?? `n_${row}`;
        const label = n.label ?? id;
        const children = n.children ?? [];
        const hasChildren = children.length > 0;
        out.push({ id, label, depth, row: row++, parentId, hasChildren, branch });
        if (collapsed.has(id))
            return;
        children.forEach((c, ci) => {
            walk(c, depth + 1, id, depth === 0 ? ci : branch);
        });
    };
    walk(root, 0, null, -1);
    return out;
}
function IndentedTree(props) {
    const theme = (0, common_1.useChartTheme)();
    const { token } = (0, theme_1.useToken)();
    const { data, width, height, side = 'right', nodeStyle = 'filled', indent = 48, rowHeight = 36, nodeHeight = 24, nodeRadius = 4, fontSize = 12, paddingTop = 10, paddingStart = 20, colorByBranch = false, lineWidth = 1.5, collapsible = false, defaultCollapsed, onToggle, style, } = props;
    const [collapsed, setCollapsed] = react_1.default.useState(() => new Set(defaultCollapsed ?? []));
    const toggle = (id) => {
        if (!collapsible)
            return;
        setCollapsed((prev) => {
            const next = new Set(prev);
            const nowExpanded = next.has(id);
            if (nowExpanded)
                next.delete(id);
            else
                next.add(id);
            onToggle?.(id, nowExpanded);
            return next;
        });
    };
    const nodes = flatten(data, collapsed);
    const byId = new Map();
    for (const n of nodes)
        byId.set(n.id, n);
    const nodeColor = (branch) => {
        if (!colorByBranch)
            return theme.primary;
        return theme.palette[branch % theme.palette.length];
    };
    const xOf = (depth) => {
        if (side === 'right')
            return paddingStart + depth * indent;
        return width - paddingStart - depth * indent;
    };
    const yOf = (row) => paddingTop + row * rowHeight;
    // 收集连线段（肘形：父底部 → 干线 → 子左缘）。干线紧贴父列左侧槽位（AntV 缩进树风格），
    // 处于所有子列节点框的左边，不会竖穿中间兄弟或更深层节点的框。
    const lines = [];
    // line 样式节点是纯文字，横线止于文字前留隙；filled/box 有实际框，横线直连框缘不留缺口
    const GAP = nodeStyle === 'line' ? 8 : 0;
    const TRUNK_OFF = Math.min(24, indent * 0.5); // 干线距父列左缘的距离（始终在父列槽位内）
    // 按父分组（保持行序）
    const groups = new Map();
    for (const n of nodes) {
        if (n.parentId == null)
            continue;
        const g = groups.get(n.parentId) ?? [];
        g.push(n);
        groups.set(n.parentId, g);
    }
    for (const [pid, children] of groups) {
        const parent = byId.get(pid);
        if (!parent)
            continue;
        const px = xOf(parent.depth);
        const py = yOf(parent.row);
        const pBotY = py + nodeHeight;
        const color = colorByBranch ? nodeColor(children[0].branch) : theme.axisLine;
        // 干线 x：紧贴父列槽位（右模式在父左缘右侧 TRUNK_OFF；左模式镜像）
        const childX = xOf(children[0].depth);
        const trunkX = side === 'right' ? px + TRUNK_OFF : px - TRUNK_OFF;
        // 父节点引出点：自身框内偏右（左模式偏左），短竖 + 水平肘线接到干线
        const pStubX = side === 'right' ? px + Math.min(24, indent * 0.75) : px - Math.min(24, indent * 0.75);
        const lastMidY = yOf(children[children.length - 1].row) + nodeHeight / 2;
        const push = (x, y, w, h) => {
            if (w <= 0 && h <= 0)
                return;
            lines.push({ x, y, w: Math.max(w, lineWidth), h: Math.max(h, lineWidth), color });
        };
        // 1) 父底部 → 肘部水平线 → 干线顶端
        const elbowY = pBotY + Math.max(2, (rowHeight - nodeHeight) / 2);
        push(pStubX, pBotY, lineWidth, elbowY - pBotY); // 短竖：从父底部中心引出
        push(Math.min(pStubX, trunkX), elbowY, Math.abs(trunkX - pStubX), lineWidth); // 水平肘线：父列 → 干线
        // 2) 干线：从肘部横线起（而非首子中心线，否则拐角处断头）到末子中心 y
        push(trunkX, elbowY, lineWidth, Math.max(lastMidY - elbowY, lineWidth));
        // 3) 每个子：干线 → 子左缘留 GAP 间隙
        for (const c of children) {
            const midY = yOf(c.row) + nodeHeight / 2;
            const hTo = side === 'right' ? childX - GAP : childX + GAP;
            push(Math.min(trunkX, hTo), midY, Math.abs(hTo - trunkX), lineWidth);
        }
    }
    return (react_1.default.createElement(components_1.View, { style: [{ width, height, position: 'relative', overflow: 'hidden' }, style] },
        lines.map((l, i) => (react_1.default.createElement(components_1.View, { key: `ln${i}`, style: {
                position: 'absolute',
                left: l.x,
                top: l.y,
                width: Math.max(l.w, lineWidth),
                height: Math.max(l.h, lineWidth),
                backgroundColor: l.color,
                opacity: nodeStyle === 'line' ? 0.8 : 0.5,
            } }))),
        nodes.map((n) => {
            const x = xOf(n.depth);
            const y = yOf(n.row);
            const color = nodeColor(n.branch);
            const isRoot = n.depth === 0;
            const inner = n.label + (n.hasChildren && collapsible ? (collapsed.has(n.id) ? ' [+]' : ' [-]') : '');
            let nodeEl;
            if (nodeStyle === 'line') {
                nodeEl = (react_1.default.createElement(components_1.Text, { style: { fontSize, color, fontWeight: isRoot ? '600' : '400', lineHeight: fontSize * 1.5 } }, inner));
            }
            else if (nodeStyle === 'box') {
                nodeEl = (react_1.default.createElement(components_1.View, { style: {
                        borderWidth: 1.2,
                        borderColor: color,
                        borderRadius: nodeRadius,
                        paddingHorizontal: 8,
                        height: nodeHeight,
                        justifyContent: 'center',
                        backgroundColor: isRoot ? color : 'transparent',
                    } },
                    react_1.default.createElement(components_1.Text, { style: { fontSize, color: isRoot ? '#fff' : color, fontWeight: isRoot ? '600' : '400' } }, inner)));
            }
            else {
                // filled
                nodeEl = (react_1.default.createElement(components_1.View, { style: {
                        backgroundColor: color,
                        borderRadius: nodeRadius,
                        paddingHorizontal: 8,
                        height: nodeHeight,
                        justifyContent: 'center',
                    } },
                    react_1.default.createElement(components_1.Text, { style: { fontSize, color: '#fff', fontWeight: isRoot ? '600' : '400' } }, inner)));
            }
            const wrapperStyle = {
                position: 'absolute',
                top: y,
                height: nodeHeight,
                justifyContent: 'center',
            };
            if (side === 'right') {
                wrapperStyle.left = x;
            }
            else {
                wrapperStyle.right = width - x;
            }
            if (collapsible && n.hasChildren) {
                return (react_1.default.createElement(components_1.Pressable, { key: n.id, onPress: () => toggle(n.id), style: [wrapperStyle, { cursor: 'pointer' }] }, nodeEl));
            }
            return (react_1.default.createElement(components_1.View, { key: n.id, style: wrapperStyle }, nodeEl));
        })));
}
exports.default = IndentedTree;
