"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Calendar = Calendar;
// Calendar：月历 / 年历。星期表头 + 6×7 日期网格，今天高亮、选中走 colorPrimary，可切换上月/下月。
// 对齐 antd v5：mode（month / year 年面板）/ validRange / disabledDate / onPanelChange /
//   dateCellRender（格内追加内容）/ dateFullCellRender（整格自定义）。
// 时区：所有「今天 / 选中 / 网格」判定统一走全局 ConfigContext.timezone（默认 Asia/Shanghai）。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const timezone_1 = require("../../utils/timezone");
const icon_1 = require("../icon");
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
function Calendar(props) {
    const { token } = (0, theme_1.useToken)();
    const timezone = (0, theme_1.useTimezone)();
    const { value, defaultValue, onChange, disabledDate, validRange, mode = 'month', modeSwitch, onPanelChange, dateCellRender, dateFullCellRender, style, } = props;
    const today = react_1.default.useMemo(() => new Date(), []);
    const todayP = react_1.default.useMemo(() => (0, timezone_1.getZonedParts)(today, timezone), [today, timezone]);
    const [inner, setInner] = react_1.default.useState(value ?? defaultValue ?? today);
    const selected = value ?? inner;
    const selP = react_1.default.useMemo(() => (0, timezone_1.getZonedParts)(selected, timezone), [selected, timezone]);
    const initialPanel = props.month ?? selected;
    const initP = react_1.default.useMemo(() => (0, timezone_1.getZonedParts)(initialPanel, timezone), [initialPanel, timezone]);
    const [viewYear, setViewYear] = react_1.default.useState(initP.year);
    const [viewMonth, setViewMonth] = react_1.default.useState(initP.month);
    const [panelMode, setPanelMode] = react_1.default.useState(mode);
    const firstWeekday = (0, timezone_1.weekdayOfCalendar)(viewYear, viewMonth, 1);
    const daysInMonth = (0, timezone_1.daysInCalendarMonth)(viewYear, viewMonth);
    // 按实际所需整周补齐（5～6 行），不强制 42 格，避免月末行留白
    const cells = [];
    for (let i = 0; i < firstWeekday; i++)
        cells.push(null);
    for (let d = 1; d <= daysInMonth; d++)
        cells.push(d);
    while (cells.length % 7 !== 0)
        cells.push(null);
    const cellDate = (d) => (0, timezone_1.zonedTimeToUtc)(viewYear, viewMonth, d, 12, 0, 0, timezone);
    const isDisabled = (date) => {
        if (validRange && (date < validRange[0] || date > validRange[1]))
            return true;
        return disabledDate ? disabledDate(date) : false;
    };
    function pick(d) {
        const next = cellDate(d);
        if (value === undefined)
            setInner(next);
        onChange && onChange(next);
    }
    function emitPanel(y, m, md) {
        onPanelChange && onPanelChange((0, timezone_1.zonedTimeToUtc)(y, m, 1, 12, 0, 0, timezone), md);
    }
    function shift(delta) {
        const y = viewYear + Math.floor((viewMonth + delta) / 12);
        const m = ((viewMonth + delta) % 12 + 12) % 12;
        setViewYear(y);
        setViewMonth(m);
        emitPanel(y, m, panelMode);
    }
    function shiftYear(delta) {
        const y = viewYear + delta;
        setViewYear(y);
        emitPanel(y, viewMonth, panelMode);
    }
    function chooseMonth(m) {
        setViewYear(viewYear);
        setViewMonth(m);
        setPanelMode('month');
        emitPanel(viewYear, m, 'month');
    }
    function toggleMode() {
        const next = panelMode === 'month' ? 'year' : 'month';
        setPanelMode(next);
        emitPanel(viewYear, viewMonth, next);
    }
    const cell = token.controlHeightLG + 4;
    const gridWidth = cell * 7;
    const navBtn = (dir) => (react_1.default.createElement(components_1.Pressable, { onPress: () => (panelMode === 'month' ? shift(dir) : shiftYear(dir)), style: { padding: token.paddingXXS } },
        react_1.default.createElement(icon_1.Icon, { name: dir < 0 ? 'left' : 'right', size: token.fontSize, color: token.colorTextSecondary, strokeWidth: 2.5 })));
    return (react_1.default.createElement(components_1.View, { style: [
            {
                width: gridWidth + token.padding * 2,
                backgroundColor: token.colorBgContainer,
                borderRadius: token.borderRadiusLG,
                borderWidth: token.lineWidth,
                borderColor: token.colorBorderSecondary,
                padding: token.padding,
            },
            style,
        ] },
        react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: token.marginSM } },
            react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText, flexShrink: 0 } }, panelMode === 'month' ? `${viewYear} 年 ${viewMonth + 1} 月` : `${viewYear} 年`),
            react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center' } },
                navBtn(-1),
                panelMode === 'month' ? (react_1.default.createElement(components_1.Pressable, { onPress: () => {
                        setViewYear(todayP.year);
                        setViewMonth(todayP.month);
                    }, style: {
                        paddingHorizontal: token.paddingXS,
                        paddingVertical: token.paddingXXS / 2,
                        marginHorizontal: token.marginXXS,
                        borderRadius: token.borderRadius,
                        borderWidth: token.lineWidth,
                        borderColor: token.colorBorderSecondary,
                    } },
                    react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextSecondary } }, "\u4ECA\u5929"))) : null,
                navBtn(1),
                modeSwitch ? (react_1.default.createElement(components_1.Pressable, { onPress: toggleMode, style: {
                        marginLeft: token.marginXS,
                        paddingHorizontal: token.paddingXS,
                        paddingVertical: token.paddingXXS / 2,
                        borderRadius: token.borderRadius,
                        borderWidth: token.lineWidth,
                        borderColor: token.colorPrimary,
                    } },
                    react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorPrimary } }, panelMode === 'month' ? '选年' : '选月'))) : null)),
        panelMode === 'year' ? (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', flexWrap: 'wrap', width: gridWidth } }, MONTHS.map((name, m) => {
            const isSelMonth = m === viewMonth;
            return (react_1.default.createElement(components_1.View, { key: name, style: { width: cell * (7 / 4), height: cell * 1.4, alignItems: 'center', justifyContent: 'center' } },
                react_1.default.createElement(components_1.Pressable, { onPress: () => chooseMonth(m), style: {
                        width: cell * (7 / 4) - 8,
                        height: cell * 1.4 - 8,
                        borderRadius: token.borderRadius,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isSelMonth ? token.colorPrimary : 'transparent',
                    } },
                    react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: isSelMonth ? token.colorTextLightSolid : token.colorText, fontWeight: isSelMonth ? '600' : '400' } }, name))));
        }))) : (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', width: gridWidth } }, WEEKDAYS.map((w) => (react_1.default.createElement(components_1.View, { key: w, style: { width: cell, alignItems: 'center', paddingVertical: token.paddingXXS } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextTertiary } }, w))))),
            react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', flexWrap: 'wrap', width: gridWidth } }, cells.map((d, i) => {
                if (d == null) {
                    return react_1.default.createElement(components_1.View, { key: i, style: { width: cell, height: cell } });
                }
                const isSelected = viewYear === selP.year && viewMonth === selP.month && d === selP.day;
                const isToday = viewYear === todayP.year && viewMonth === todayP.month && d === todayP.day;
                const date = cellDate(d);
                const dis = isDisabled(date);
                const info = {
                    date,
                    year: viewYear,
                    month: viewMonth,
                    day: d,
                    selected: isSelected,
                    today: isToday,
                    disabled: dis,
                };
                // 整格自定义：外层保住网格尺寸 + 可点击选中
                if (dateFullCellRender) {
                    return (react_1.default.createElement(components_1.View, { key: i, style: { width: cell, height: cell, alignItems: 'center', justifyContent: 'center' } },
                        react_1.default.createElement(components_1.Pressable, { disabled: dis, onPress: () => pick(d), style: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' } }, dateFullCellRender(info))));
                }
                return (react_1.default.createElement(components_1.View, { key: i, style: { width: cell, height: cell, alignItems: 'center', justifyContent: 'center' } },
                    react_1.default.createElement(components_1.Pressable, { disabled: dis, onPress: () => pick(d), style: {
                            width: cell - 8,
                            height: cell - 8,
                            borderRadius: token.borderRadius,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isSelected
                                ? token.colorPrimary
                                : isToday
                                    ? token.colorPrimaryBg
                                    : 'transparent',
                        } },
                        react_1.default.createElement(components_1.Text, { style: {
                                fontSize: token.fontSize,
                                color: dis
                                    ? token.colorTextQuaternary
                                    : isSelected
                                        ? token.colorTextLightSolid
                                        : isToday
                                            ? token.colorPrimary
                                            : token.colorText,
                                fontWeight: isToday || isSelected ? '600' : '400',
                            } }, d),
                        dateCellRender ? react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: 0, right: 0, bottom: 2, alignItems: 'center' } }, dateCellRender(info)) : null)));
            }))))));
}
exports.default = Calendar;
