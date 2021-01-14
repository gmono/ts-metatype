"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.value = exports.validate = exports.multi = exports.ANY = exports.Any = void 0;
function Any() {
    return null;
}
exports.Any = Any;
exports.ANY = Any;
function multi(sth) {
    return sth;
}
exports.multi = multi;
function validate(typedef, value) {
    const tp = typedef;
    const rawMap = {
        string: String,
        number: Number,
        object: Object,
    };
    for (let k in rawMap) {
        if (typeof value == k)
            return tp == rawMap[k];
    }
    if (typeof typedef == "function") {
        return value instanceof tp;
    }
    if (typedef instanceof Array) {
        let ok = false;
        for (let tt of typedef) {
            if (validate(tt, value)) {
                ok = true;
                break;
            }
        }
        return ok;
    }
    if (typeof typedef == "object") {
        let ok = true;
        const v = value;
        for (let k in typedef) {
            if (!validate(tp[k], v[k]))
                return false;
        }
        return true;
    }
    return false;
}
exports.validate = validate;
function value(typedef, value, full = false) {
    return value;
}
exports.value = value;
