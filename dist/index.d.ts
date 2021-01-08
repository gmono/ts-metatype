import type { MapTypeLong } from "ts-metacode";
export declare type TypeDef = {
    [idx: string]: TypeDef;
} | Function[] | Function;
declare type BaseTypeMap = [
    [
        String,
        string
    ],
    [
        Number,
        number
    ],
    [
        any[],
        any[]
    ],
    [
        ANYTYPE,
        any
    ],
    [
        Object,
        object
    ]
];
declare type ANYTYPE = {};
export declare function ANY(): ANYTYPE;
/**
 * 用于声明元组,不使用此函数声明的则是或类型数组
 * @param sth 元组
 */
export declare function multi<T extends any[] | [any, ...any[]]>(sth: T): T;
export declare function validate<T extends TypeDef>(typedef: T, value: TypeOf<T>): value is TypeOf<T>;
declare type MapBaseType<T> = MapTypeLong<T, BaseTypeMap>;
export declare type TypeOf<T> = T extends (new (...args: any) => infer P) ? MapBaseType<P> : T extends ((...args: any) => infer PP) ? MapBaseType<PP> : _TypeOf<T>;
declare type _TypeOf<T> = {
    [idx in keyof T]: T[idx] extends (new (...args: any) => infer P) ? MapBaseType<P> : T[idx] extends ((...args: any) => infer PP) ? MapBaseType<PP> : T[idx] extends (infer PPP)[] ? TypeOf<PPP>[] : T[idx] extends TypeDef ? _TypeOf<T[idx]> : never;
};
export {};
