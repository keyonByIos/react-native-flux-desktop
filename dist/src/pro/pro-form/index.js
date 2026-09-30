"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProForm = ProForm;
// ProForm：schema 驱动的轻量表单。fields 数组声明 → 自动栅格排布 + 受控值 + 逐字段校验。
// 组合既有原子件（Input / InputNumber / Select / Radio / Checkbox / Switch / TextArea），
// 自身只管「值收集 + 规则校验 + 错误回显 + 提交流程」，控件渲染全部委托，保持薄。
// 校验时机：值变化后该字段即时复验（先触错后修正能立刻消错）；提交时全量校验并聚焦错误数提示。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const input_1 = require("../../ui/input");
const input_number_1 = require("../../ui/input-number");
const text_area_1 = require("../../ui/text-area");
const select_1 = require("../../ui/select");
const radio_1 = require("../../ui/radio");
const checkbox_1 = require("../../ui/checkbox");
const switch_1 = require("../../ui/switch");
const button_1 = require("../../ui/button");
const common_1 = require("../../chart/core/common");
/** 空值判定（required 用）：undefined/null/'' 视为空，空数组也视为空。 */
function isEmpty(v) {
    if (v === undefined || v === null || v === '')
        return true;
    if (Array.isArray(v))
        return v.length === 0;
    return false;
}
/** 单字段校验：返回首个错误文案，无错返回 null。 */
function runRules(field, value, all) {
    for (const r of field.rules ?? []) {
        if (r.required && isEmpty(value))
            return r.requiredMessage ?? `请填写${field.label ?? field.name}`;
        if (isEmpty(value))
            continue;
        if (r.pattern && typeof value === 'string' && !r.pattern.test(value))
            return r.message ?? `${field.label ?? field.name}格式不正确`;
        if (typeof value === 'string' && (r.min != null || r.max != null)) {
            if (r.min != null && value.length < r.min)
                return r.message ?? `${field.label ?? field.name}至少 ${r.min} 个字符`;
            if (r.max != null && value.length > r.max)
                return r.message ?? `${field.label ?? field.name}最多 ${r.max} 个字符`;
        }
        if (typeof value === 'number' && (r.min != null || r.max != null)) {
            if (r.min != null && value < r.min)
                return r.message ?? `${field.label ?? field.name}不小于 ${r.min}`;
            if (r.max != null && value > r.max)
                return r.message ?? `${field.label ?? field.name}不大于 ${r.max}`;
        }
        const custom = r.validator?.(value, all);
        if (custom)
            return custom;
    }
    return null;
}
function ProForm(props) {
    const { token } = (0, theme_1.useToken)();
    const { fields, title, columns = 2, gap, values: controlled, defaultValue, onValuesChange, onFinish, onFinishFailed, submitter, actions, style, } = props;
    const initial = react_1.default.useMemo(() => {
        const out = { ...(defaultValue ?? {}) };
        for (const f of fields)
            if (out[f.name] === undefined && f.initialValue !== undefined)
                out[f.name] = f.initialValue;
        return out;
        // fields 结构变化时才重算，避免每次渲染丢用户输入
    }, [fields, defaultValue]);
    const [inner, setInner] = react_1.default.useState(initial);
    const values = controlled ?? inner;
    const [errors, setErrors] = react_1.default.useState({});
    const [submitting, setSubmitting] = react_1.default.useState(false);
    const columnGap = gap ?? token.marginLG;
    const collect = (patch) => {
        const next = { ...(controlled ?? inner), ...patch };
        if (controlled === undefined)
            setInner(next);
        onValuesChange?.(patch, next);
    };
    const validateAll = () => {
        const out = {};
        for (const f of fields) {
            const e = runRules(f, values[f.name], values);
            if (e)
                out[f.name] = e;
        }
        return out;
    };
    // 值变化：该字段已报错则即时复验（改对了立刻消错，未报错不打扰）
    const change = (field, v) => {
        const next = { ...values, [field.name]: v };
        collect({ [field.name]: v });
        if (errors[field.name] != null) {
            const e = runRules(field, v, next);
            setErrors((prev) => {
                const copy = { ...prev };
                if (e)
                    copy[field.name] = e;
                else
                    delete copy[field.name];
                return copy;
            });
        }
    };
    const submit = async () => {
        const errs = validateAll();
        setErrors(errs);
        if (Object.keys(errs).length > 0) {
            onFinishFailed?.(errs);
            return;
        }
        try {
            setSubmitting(true);
            await onFinish?.(values);
        }
        finally {
            setSubmitting(false);
        }
    };
    const reset = () => {
        if (controlled === undefined)
            setInner(initial);
        setErrors({});
    };
    // 命令式句柄：每次渲染刷新闭包，父级 ref.current 始终拿到最新 values
    if (actions) {
        actions.current = {
            reset,
            clearValidate: () => setErrors({}),
            setValues: (patch) => collect(patch),
            // validate 同时把错误写回界面（只返回布尔不显错的话，外部调用方还得自己 set）
            validate: () => {
                const errs = validateAll();
                setErrors(errs);
                return Object.keys(errs).length === 0;
            },
        };
    }
    const errorCount = Object.keys(errors).length;
    // 本栈样式层不支持 calc() 字符串，列宽用实测容器宽像素均分：
    // cell = (W - (columns-1)*gap) / columns；span 占多列时再补上跨过的间隙。
    const [measuredW, onFormLayout] = (0, common_1.useMeasuredWidth)(640);
    const cell = Math.max(160, (measuredW - (columns - 1) * columnGap) / columns);
    const widthOf = (span) => {
        const s = Math.max(1, Math.min(span ?? 1, columns));
        return cell * s + columnGap * (s - 1);
    };
    return (react_1.default.createElement(components_1.View, { style: [{ gap: token.marginSM }, style] },
        title ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeLG, color: token.colorText, fontWeight: '600' } }, title)) : null,
        react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', flexWrap: 'wrap', columnGap: columnGap, rowGap: token.marginSM }, onLayout: onFormLayout }, fields.map((f) => (react_1.default.createElement(components_1.View, { key: f.name, style: { width: widthOf(f.span), gap: token.marginXXS } },
            f.type === 'switch' ? (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } },
                react_1.default.createElement(Label, { label: f.label, required: (f.rules ?? []).some((r) => r.required), token: token }),
                react_1.default.createElement(switch_1.Switch, { checked: !!values[f.name], disabled: f.disabled, onChange: (v) => change(f, v), ...(f.fieldProps ?? {}) }))) : (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(Label, { label: f.label, required: (f.rules ?? []).some((r) => r.required), token: token }),
                react_1.default.createElement(FieldControl, { field: f, value: values[f.name], errored: errors[f.name] != null, token: token, onChange: (v) => change(f, v) }))),
            errors[f.name] != null ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorError } }, errors[f.name])) : f.tooltip ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextTertiary } }, f.tooltip)) : null)))),
        submitter !== false ? (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: token.marginXS, marginTop: token.marginXXS } },
            react_1.default.createElement(button_1.Button, { size: "small", onPress: reset }, (typeof submitter === 'object' && submitter.resetText) || '重置'),
            react_1.default.createElement(button_1.Button, { size: "small", type: "primary", loading: submitting, onPress: submit }, (typeof submitter === 'object' && submitter.submitText) || '提交'),
            errorCount > 0 ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorError } },
                "\u6709 ",
                errorCount,
                " \u9879\u672A\u901A\u8FC7\u6821\u9A8C")) : null)) : null));
}
/** 字段标签：必填红星 + 次级灰字。 */
function Label(props) {
    const { label, required, token } = props;
    if (!label)
        return null;
    return (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: 2 } },
        required ? react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorError } }, "*") : null,
        react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextSecondary } }, label)));
}
/** 值控件分发：type → 原子件；status=error 让控件描红，错误文案由外层显示。 */
function FieldControl(props) {
    const { field, value, errored, onChange } = props;
    const fp = field.fieldProps ?? {};
    const status = errored ? 'error' : undefined;
    switch (field.type ?? 'text') {
        case 'custom':
            return react_1.default.createElement(react_1.default.Fragment, null, field.render?.(value, { [field.name]: value }));
        case 'textarea':
            return react_1.default.createElement(text_area_1.TextArea, { value: value ?? '', status: status, disabled: field.disabled, onChange: onChange, ...fp });
        case 'number':
            return react_1.default.createElement(input_number_1.InputNumber, { value: value ?? undefined, status: status, disabled: field.disabled, onChange: onChange, ...fp });
        case 'select': {
            // options 提出来显式传：它是指针字段，依赖对象展开的宽松推断会丢类型
            const { options, ...rest } = fp;
            return (react_1.default.createElement(select_1.Select, { options: options ?? [], value: value, status: status, disabled: field.disabled, onChange: (v) => onChange(v), ...rest }));
        }
        case 'radio':
            return react_1.default.createElement(radio_1.Radio.Group, { value: value, disabled: field.disabled, onChange: onChange, ...fp });
        case 'checkbox':
            return react_1.default.createElement(checkbox_1.Checkbox.Group, { value: value ?? [], disabled: field.disabled, onChange: (v) => onChange(v), ...fp });
        case 'switch':
            return null; // 已在字段行内联渲染
        default:
            return react_1.default.createElement(input_1.Input, { value: value ?? '', status: status, disabled: field.disabled, onChange: onChange, ...fp });
    }
}
exports.default = ProForm;
