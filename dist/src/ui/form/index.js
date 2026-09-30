"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Form = void 0;
// FORM：表单容器 + 条目校验（对齐 antd 常用 API 的自绘降级实现，无 useForm 全局句柄）。
// 数据流：Form 持 values 与字段注册表（Context 下发）；Form.Item 注册 validate 句柄、
// 克隆 children 注入 value/onChange（Switch 类注入 checked）；提交时逐字段校验，
// 全过 onFinish(values)，有错逐项显示红字 + onFinishFailed(errors)。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const button_1 = require("../button");
const Ctx = react_1.default.createContext(null);
/** 同步规则校验；async validator 由 Item 的 validate 单独补跑 */
function syncRules(v, rules) {
    for (const r of rules) {
        const empty = v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
        if (r.required && empty)
            return r.message || '该项为必填';
        if (empty)
            continue;
        if (r.pattern && typeof v === 'string' && !r.pattern.test(v))
            return r.message || '格式不正确';
        const len = typeof v === 'string' || Array.isArray(v) ? v.length : undefined;
        if (len !== undefined) {
            if (r.min !== undefined && len < r.min)
                return r.message || `长度/个数不能少于 ${r.min}`;
            if (r.max !== undefined && len > r.max)
                return r.message || `长度/个数不能超过 ${r.max}`;
        }
    }
    return null;
}
function runAsync(v, rules) {
    const r = rules.find((x) => x.validator);
    if (!r)
        return Promise.resolve(null);
    return Promise.resolve(r.validator(v)).then((x) => x === false ? r.message || '校验失败' : typeof x === 'string' ? x : null);
}
function FormComp(props) {
    const { token } = (0, theme_1.useToken)();
    const { children, layout = 'vertical', labelWidth = 96, initialValues = {}, onFinish, onFinishFailed, style } = props;
    const [values, setValues] = react_1.default.useState(initialValues);
    const valuesRef = react_1.default.useRef(values);
    valuesRef.current = values;
    const fieldsRef = react_1.default.useRef(new Map());
    const set = (name, v) => {
        setValues((prev) => ({ ...prev, [name]: v }));
    };
    const register = (name, h) => {
        fieldsRef.current.set(name, h);
    };
    const unregister = (name) => {
        fieldsRef.current.delete(name);
    };
    const submit = () => {
        const list = Array.from(fieldsRef.current.entries());
        Promise.all(list.map(([, h]) => h())).then((errs) => {
            const errors = {};
            errs.forEach((e, i) => {
                if (e)
                    errors[list[i][0]] = e;
            });
            if (Object.keys(errors).length === 0)
                onFinish && onFinish({ ...valuesRef.current });
            else
                onFinishFailed && onFinishFailed(errors);
        });
    };
    const ctx = { values, set, register, unregister, submit, layout, labelW: labelWidth };
    return (react_1.default.createElement(Ctx.Provider, { value: ctx },
        react_1.default.createElement(components_1.View, { style: [
                { gap: token.margin },
                layout === 'inline' ? { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' } : null,
                style,
            ] }, children)));
}
function FormItem(props) {
    const { token } = (0, theme_1.useToken)();
    const { label, name, rules = [], required, help, children, style } = props;
    const form = react_1.default.useContext(Ctx);
    const v = form && name ? form.values[name] : undefined;
    const [err, setErr] = react_1.default.useState(null);
    const vRef = react_1.default.useRef(v);
    vRef.current = v;
    const rulesRef = react_1.default.useRef(rules);
    rulesRef.current = rules;
    const validate = () => {
        const e = syncRules(vRef.current, rulesRef.current);
        return Promise.resolve(e !== null ? e : runAsync(vRef.current, rulesRef.current)).then((x) => {
            setErr(x);
            return x;
        });
    };
    react_1.default.useEffect(() => {
        if (!name || !form)
            return;
        form.register(name, validate);
        return () => form.unregister(name);
    });
    const setField = (nv) => {
        if (name && form)
            form.set(name, nv);
        // 改值即重校验（已报错的字段实时消错）
        if (err !== null) {
            const e = syncRules(nv, rulesRef.current);
            if (e === null)
                setErr(null);
        }
    };
    const childEl = react_1.default.isValidElement(children) ? children : null;
    const isSwitchLike = childEl && typeof childEl.props.checked === 'boolean';
    const child = childEl
        ? react_1.default.cloneElement(childEl, {
            ...(isSwitchLike ? { checked: !!v } : { value: v }),
            onChange: setField,
            status: err ? 'error' : childEl.props.status,
        })
        : children;
    const labelEl = label != null && (react_1.default.createElement(components_1.View, { style: {
            width: form?.layout === 'horizontal' ? form.labelW : undefined,
            marginRight: form?.layout === 'horizontal' ? token.marginXS : 0,
            marginBottom: form?.layout === 'horizontal' ? 0 : token.marginXXS,
            paddingTop: form?.layout === 'horizontal' ? token.paddingXXS : 0,
        } },
        react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: token.colorText } },
            (required || rules.some((r) => r.required)) && react_1.default.createElement(components_1.Text, { style: { color: token.colorError } }, "* "),
            label)));
    return (react_1.default.createElement(components_1.View, { style: style },
        react_1.default.createElement(components_1.View, { style: {
                flexDirection: form?.layout === 'horizontal' ? 'row' : 'column',
                alignItems: form?.layout === 'horizontal' ? 'flex-start' : 'stretch',
            } },
            labelEl,
            react_1.default.createElement(components_1.View, { style: { flex: 1, minWidth: 120 } }, child)),
        err ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorError, marginTop: token.marginXXS } }, err)) : help ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextTertiary, marginTop: token.marginXXS } }, help)) : null));
}
/** 提交按钮：走所属 Form 的 submit（全量校验） */
function FormSubmit(props) {
    const form = react_1.default.useContext(Ctx);
    return (react_1.default.createElement(components_1.View, { style: props.style },
        react_1.default.createElement(button_1.Button, { type: "primary", onPress: () => form && form.submit() }, props.text ?? '提交')));
}
exports.Form = Object.assign(FormComp, { Item: FormItem, Submit: FormSubmit });
exports.default = exports.Form;
