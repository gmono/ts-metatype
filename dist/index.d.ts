import type { MapTypeLong } from "ts-metacode";
export declare type TypeDef = {
    [idx: string]: TypeDef;
} | Function[] | Function;
declare type BaseTypeMap = [
    [
        StringConstructor,
        string
    ],
    [
        NumberConstructor,
        number
    ],
    [
        ObjectConstructor,
        object
    ],
    [
        ArrayConstructor,
        any[]
    ],
    [
        any,
        never
    ]
];
export declare function Any(): any;
export { Any as ANY };
export declare function multi<T extends any[] | [any, ...any[]]>(sth: T): T;
export declare function validate<T extends TypeDef>(typedef: T, value: TypeOf<T>): value is TypeOf<T>;
export declare function value<T extends TypeDef>(typedef: T, value: TypeOf<T>, full?: boolean): TypeOf<T>;
declare type MapBaseType<Cons> = MapTypeLong<Cons, BaseTypeMap>;
export declare type TypeOf<T> = MapBaseType<T> extends never ? _Type<T> : MapBaseType<T>;
declare type _Type<T> = T extends (new (...args: any) => infer P) ? P : T extends ((...args: any) => infer PP) ? PP : __Type<T>;
declare type __Type<T> = {
    [idx in keyof T]: TypeOf<T[idx]>;
};
