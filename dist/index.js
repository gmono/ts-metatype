"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.multi = exports.ANY = void 0;
function ANY() {
    //构造器返回的应该是默认值
    return {};
}
exports.ANY = ANY;
/**
 * 用于声明元组,不使用此函数声明的则是或类型数组
 * @param sth 元组
 */
function multi(sth) {
    return sth;
}
exports.multi = multi;
//工具函数
function validate(typedef, value) {
    // 每一个成员都校验成功
    // 原生类型需要使用typeof判断
    const tp = typedef;
    const rawMap = {
        string: String,
        number: Number
    };
    for (let k in rawMap) {
        if (typeof value == k)
            return tp == rawMap[k];
    }
    //到这里说明没找到 不是原生类型 
    if (typeof typedef == "function") {
        // 构造器或构造函数
        // 这里可以自动追溯 在原型链上
        return value instanceof tp;
    }
    if (typeof typedef == "object") {
        // 每个成员都validate成功
        let ok = true;
        const v = value;
        for (let k in typedef) {
            //没提供值就是undefined
            //! 这里要处理v本身是null和undefined的情况
            if (!validate(tp[k], v[k]))
                return false;
        }
        return true;
    }
}
exports.validate = validate;
// 测试部分
const tp = {
    a: Object,
    b: String,
    c: Number,
    h: {
        c: Object
    },
    k: multi([Object, Array, String]),
    // default this declare a type of (number|object)[]
    s: [Object, Number],
    sss: ANY
};
