"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Table = Table;
// Table：轻量数据表格。columns 配置 + dataSource 行数据，表头 + 斑马纹 + 行悬停高亮。
// 对齐 antd v5：size 三档密度、loading 遮罩、列 sorter（点击表头 升→降→无 循环 + 双向箭头指示）、
// rowSelection（checkbox / radio 受控选择，含全选 / 半选）。纯展示，无虚拟滚动。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
const checkbox_1 = require("../checkbox");
const radio_1 = require("../radio");
const spin_1 = require("../spin");
function colKey(col) {
    return String(col.key ?? col.dataIndex ?? '');
}
function cellValue(row, dataIndex) {
    if (dataIndex == null)
        return undefined;
    return row[dataIndex];
}
function Table(props) {
    const { token } = (0, theme_1.useToken)();
    const { columns, dataSource, rowKey, size = 'large', striped, bordered, loading, rowSelection, emptyText = '暂无数据', onRowPress, onSorterChange, style, } = props;
    const [hoverRow, setHoverRow] = react_1.default.useState(-1);
    // 初始排序：取带 defaultSortOrder 的列
    const [sort, setSort] = react_1.default.useState(() => {
        const c = columns.find((col) => col.sorter && col.defaultSortOrder);
        return c ? { key: colKey(c), order: c.defaultSortOrder } : null;
    });
    const padV = size === 'small' ? token.paddingXS : size === 'middle' ? token.paddingSM : token.padding;
    const padH = size === 'small' ? token.paddingXS : token.padding;
    const keyOf = (row, index) => (rowKey ? rowKey(row, index) : index);
    const toggleSort = (col) => {
        if (!col.sorter)
            return;
        const key = colKey(col);
        setSort((prev) => {
            let next;
            if (!prev || prev.key !== key)
                next = { key, order: 'ascend' };
            else if (prev.order === 'ascend')
                next = { key, order: 'descend' };
            else
                next = null;
            onSorterChange && onSorterChange(next ? { columnKey: next.key, order: next.order } : null);
            return next;
        });
    };
    // 排序后的展示数据
    const displayData = react_1.default.useMemo(() => {
        if (!sort)
            return dataSource;
        const col = columns.find((c) => colKey(c) === sort.key);
        if (!col?.sorter)
            return dataSource;
        const arr = dataSource.slice();
        arr.sort((a, b) => (sort.order === 'ascend' ? col.sorter(a, b) : col.sorter(b, a)));
        return arr;
    }, [dataSource, sort, columns]);
    // 选择相关
    const selType = rowSelection?.type ?? 'checkbox';
    const selectedKeys = rowSelection ? rowSelection.selectedRowKeys.map(String) : [];
    const allKeys = displayData.map((row, i) => String(keyOf(row, i)));
    const selectableKeys = rowSelection
        ? displayData.filter((row) => !(rowSelection.getCheckboxProps?.(row)?.disabled)).map((row, i) => String(keyOf(row, i)))
        : [];
    const allChecked = selectableKeys.length > 0 && selectableKeys.every((k) => selectedKeys.indexOf(k) >= 0);
    const someChecked = selectableKeys.some((k) => selectedKeys.indexOf(k) >= 0);
    const toggleRow = (row, index, on) => {
        if (!rowSelection)
            return;
        const k = String(keyOf(row, index));
        let nextKeys;
        if (selType === 'radio')
            nextKeys = on ? [k] : [];
        else
            nextKeys = on ? selectedKeys.concat(k) : selectedKeys.filter((x) => x !== k);
        const nextRows = displayData.filter((r, i) => nextKeys.indexOf(String(keyOf(r, i))) >= 0);
        rowSelection.onChange(nextKeys, nextRows);
    };
    const toggleAll = (on) => {
        if (!rowSelection)
            return;
        const nextKeys = on ? selectableKeys.slice() : [];
        const nextRows = displayData.filter((r, i) => nextKeys.indexOf(String(keyOf(r, i))) >= 0);
        rowSelection.onChange(nextKeys, nextRows);
    };
    const cellText = (align) => ({
        fontSize: token.fontSize,
        color: token.colorText,
        textAlign: align ?? 'left',
    });
    const sortCaret = (active) => (react_1.default.createElement(components_1.View, { style: { marginLeft: token.marginXXS, justifyContent: 'center' } },
        react_1.default.createElement(icon_1.Icon, { name: "up", size: 10, strokeWidth: 3, color: active === 'ascend' ? token.colorPrimary : token.colorTextQuaternary }),
        react_1.default.createElement(icon_1.Icon, { name: "down", size: 10, strokeWidth: 3, color: active === 'descend' ? token.colorPrimary : token.colorTextQuaternary })));
    const headerCell = (col, i) => {
        const inner = (react_1.default.createElement(components_1.View, { style: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start',
            } },
            react_1.default.createElement(components_1.Text, { style: { ...cellText(col.align), fontWeight: '600', color: token.colorText } }, col.title),
            col.sorter ? sortCaret(sort && sort.key === colKey(col) ? sort.order : undefined) : null));
        const cellStyle = {
            width: col.width,
            flex: typeof col.width === 'number' ? undefined : 1,
            paddingHorizontal: padH,
            paddingVertical: padV,
            borderRightWidth: bordered ? token.lineWidth : 0,
            borderRightColor: token.colorBorderSecondary,
        };
        return col.sorter ? (react_1.default.createElement(components_1.Pressable, { key: i, onPress: () => toggleSort(col), style: [cellStyle, { cursor: 'pointer' }] }, inner)) : (react_1.default.createElement(components_1.View, { key: i, style: cellStyle }, inner));
    };
    const bodyCell = (col, row, index, i) => {
        const value = cellValue(row, col.dataIndex);
        const content = col.render ? col.render(value, row, index) : value != null ? String(value) : '';
        return (react_1.default.createElement(components_1.View, { key: i, style: {
                width: col.width,
                flex: typeof col.width === 'number' ? undefined : 1,
                paddingHorizontal: padH,
                paddingVertical: padV,
                justifyContent: 'center',
                borderRightWidth: bordered ? token.lineWidth : 0,
                borderRightColor: token.colorBorderSecondary,
            } }, typeof content === 'string' ? react_1.default.createElement(components_1.Text, { style: cellText(col.align) }, content) : content));
    };
    const selWidth = rowSelection?.columnWidth ?? 48;
    return (react_1.default.createElement(components_1.View, { style: { position: 'relative' } },
        react_1.default.createElement(components_1.View, { style: [
                {
                    backgroundColor: token.colorBgContainer,
                    borderRadius: token.borderRadiusLG,
                    borderWidth: bordered ? token.lineWidth : 0,
                    borderColor: token.colorBorderSecondary,
                    overflow: 'hidden',
                    opacity: loading ? 0.5 : 1,
                },
                style,
            ] },
            react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', backgroundColor: token.colorFillQuaternary } },
                rowSelection ? (react_1.default.createElement(components_1.View, { style: { width: selWidth, paddingHorizontal: padH, paddingVertical: padV, alignItems: 'center', justifyContent: 'center' } }, selType === 'checkbox' ? (react_1.default.createElement(checkbox_1.Checkbox, { checked: allChecked, indeterminate: !allChecked && someChecked, onChange: toggleAll })) : null)) : null,
                columns.map(headerCell)),
            displayData.length === 0 ? (react_1.default.createElement(components_1.View, { style: { padding: token.paddingXL, alignItems: 'center' } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: token.colorTextTertiary } }, emptyText))) : (displayData.map((row, index) => {
                const bg = hoverRow === index
                    ? token.colorFillQuaternary
                    : striped && index % 2 === 1
                        ? token.colorFillTertiary
                        : 'transparent';
                const k = String(keyOf(row, index));
                const checked = selectedKeys.indexOf(k) >= 0;
                const rowDisabled = !!rowSelection?.getCheckboxProps?.(row)?.disabled;
                const line = (react_1.default.createElement(components_1.View, { style: {
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: bg,
                        borderTopWidth: index > 0 ? token.lineWidth : 0,
                        borderTopColor: token.colorBorderSecondary,
                    } },
                    rowSelection ? (react_1.default.createElement(components_1.View, { style: { width: selWidth, paddingHorizontal: padH, paddingVertical: padV, alignItems: 'center', justifyContent: 'center' } }, selType === 'radio' ? (react_1.default.createElement(radio_1.Radio, { checked: checked, disabled: rowDisabled, onChange: () => toggleRow(row, index, true) })) : (react_1.default.createElement(checkbox_1.Checkbox, { checked: checked, disabled: rowDisabled, onChange: (on) => toggleRow(row, index, on) })))) : null,
                    columns.map((col, i) => bodyCell(col, row, index, i))));
                return (react_1.default.createElement(components_1.Pressable, { key: k, onMouseEnter: () => setHoverRow(index), onMouseLeave: () => setHoverRow(-1), onPress: onRowPress ? () => onRowPress(row, index) : undefined }, line));
            }))),
        loading ? (react_1.default.createElement(components_1.View, { style: {
                position: 'absolute',
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
            } },
            react_1.default.createElement(spin_1.Spin, null))) : null));
}
exports.default = Table;
