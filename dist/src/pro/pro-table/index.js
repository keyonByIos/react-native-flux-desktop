"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProTable = ProTable;
// ProTable：中后台「筛选 + 工具栏 + 表格 + 分页」一体的高阶表格（Pro 菜单组件）。
// 组合既有原子件（Input/Select/Button/Table/Pagination），两种数据模式：
//   本地模式 —— 传 dataSource，按已应用筛选谓词前端过滤后分页切片；
//   异步模式 —— 传 request(params)，筛选/翻页变化即回调 request，由业务侧回填 dataSource+total（受控）。
// 搜索项两个来源：columns[].search（对 dataIndex 生效）+ filterFields（额外字段），草稿/已应用两态分离，
// 点「查询」才提交 —— 与 antd ProTable 的 search 心智一致。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const button_1 = require("../../ui/button");
const input_1 = require("../../ui/input");
const select_1 = require("../../ui/select");
const table_1 = require("../../ui/table");
const pagination_1 = require("../../ui/pagination");
function getValue(row, dataIndex) {
    if (dataIndex == null || row == null)
        return undefined;
    const s = String(dataIndex);
    if (s.indexOf('.') < 0)
        return row[s];
    return s.split('.').reduce((o, k) => (o == null ? undefined : o[k]), row);
}
function ProTable(props) {
    const { columns, dataSource, rowKey, headerTitle, toolBarRender, filterFields = [], search: searchOff, request, total, loading, pageSize: pageSizeProp, pagination = true, size, bordered, striped, onRowPress, style, } = props;
    const { token } = (0, theme_1.useToken)();
    const [draft, setDraft] = react_1.default.useState({});
    const [applied, setApplied] = react_1.default.useState({});
    const [page, setPage] = react_1.default.useState(1);
    const pageSize = pageSizeProp ?? 10;
    const asyncMode = typeof request === 'function';
    // 搜索项 = columns 里带 search 的 + filterFields（统一成 ProFilterField 形状）
    const colSearches = columns
        .filter((c) => c.search)
        .map((c) => ({ name: String(c.key ?? c.dataIndex), label: typeof c.title === 'string' ? c.title : String(c.key ?? c.dataIndex), type: 'input' }));
    const fields = searchOff === false ? [] : [...colSearches, ...filterFields.map((f) => ({ ...f, type: (f.type ?? 'input') }))];
    const query = () => {
        setApplied({ ...draft });
        setPage(1);
    };
    const reset = () => {
        setDraft({});
        setApplied({});
        setPage(1);
    };
    // 本地过滤
    const filtered = react_1.default.useMemo(() => {
        if (asyncMode)
            return dataSource;
        let rows = dataSource;
        for (const [name, val] of Object.entries(applied)) {
            if (val === '')
                continue;
            const col = columns.find((c) => String(c.key ?? c.dataIndex) === name);
            const matcher = col?.search;
            rows = rows.filter((row) => {
                const v = getValue(row, col?.dataIndex);
                if (typeof matcher === 'function')
                    return matcher(v, val);
                return String(v ?? '').toLowerCase().indexOf(val.toLowerCase()) >= 0;
            });
        }
        return rows;
    }, [dataSource, applied, asyncMode, columns]);
    const shown = asyncMode ? dataSource : filtered.slice((page - 1) * pageSize, page * pageSize);
    const shownTotal = asyncMode ? total ?? dataSource.length : filtered.length;
    // 异步模式：applied/page 变化即通知业务侧（含首次挂载）
    const reqRef = react_1.default.useRef(0);
    react_1.default.useEffect(() => {
        if (!asyncMode)
            return;
        reqRef.current += 1;
        request?.({ page, pageSize, filters: applied });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [asyncMode, applied, page, pageSize]);
    return (react_1.default.createElement(components_1.View, { style: [{ gap: token.marginSM }, style] },
        fields.length > 0 ? (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: token.marginXS } },
            fields.map((f) => (react_1.default.createElement(components_1.View, { key: f.name, style: { flexDirection: 'row', alignItems: 'center', gap: token.marginXXS } },
                f.label != null ? react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: token.colorTextSecondary } }, f.label) : null,
                f.type === 'select' ? (react_1.default.createElement(select_1.Select, { options: f.options ?? [], value: draft[f.name] !== undefined && draft[f.name] !== '' ? draft[f.name] : undefined, placeholder: f.placeholder ?? '请选择', allowClear: true, style: { width: f.width ?? 150 }, onChange: (v) => setDraft((d) => ({ ...d, [f.name]: Array.isArray(v) ? String(v[0] ?? '') : String(v ?? '') })) })) : (react_1.default.createElement(input_1.Input, { value: draft[f.name] ?? '', placeholder: f.placeholder ?? `请输入${f.label ?? ''}`, allowClear: true, style: { width: f.width ?? 180 }, onChange: (v) => setDraft((d) => ({ ...d, [f.name]: v })), onPressEnter: query }))))),
            react_1.default.createElement(button_1.Button, { type: "primary", size: "small", onPress: query }, "\u67E5\u8BE2"),
            react_1.default.createElement(button_1.Button, { size: "small", onPress: reset }, "\u91CD\u7F6E"))) : null,
        headerTitle != null || toolBarRender != null ? (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } },
            react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText } }, headerTitle),
            react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: token.marginXS } }, toolBarRender))) : null,
        react_1.default.createElement(table_1.Table, { columns: columns, dataSource: shown, rowKey: rowKey, loading: loading, size: size, bordered: bordered, striped: striped, onRowPress: onRowPress }),
        pagination ? (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', justifyContent: 'flex-end' } },
            react_1.default.createElement(pagination_1.Pagination, { current: page, pageSize: pageSize, total: shownTotal, onChange: (p) => setPage(p) }))) : null));
}
exports.default = ProTable;
