import type { MapTypeLong } from "ts-metacode";
//定义类型
// 功能 校验 生成默认值  编辑(setValue函数 自带校验) 生成类型
//使用构造器定义内心类型
type TypeDef = { [idx: string]: TypeDef } | Function[] | Function;
// 基本类型映射表
// 请勿改变顺序！
type BaseTypeMap = [
  [String, string],
  [Number, number],
  [any[], any[]],
  [ANYTYPE,any],
  [Object, object],
]

type ANYTYPE = {};
function ANY(): ()=>ANYTYPE{
  //构造器返回的应该是默认值
  return () => ({});
}
type Any = typeof ANY;
/**
 * 用于声明元组,不使用此函数声明的则是或类型数组
 * @param sth 元组
 */
function multi<T extends any[]|[any,...any[]]>(sth: T): T{
  return sth;
}
//工具函数
export function validate<T extends TypeDef>(typedef: T, value: TypeOf<T>):value is TypeOf<T> {
}


export function setValue(typedef: any, value: any) {
  //先校验再赋值
}
// 类型提取器
//类型提取系统
// 请勿修改以便避免奇怪的结果
type MapBaseType<T> = MapTypeLong<T, BaseTypeMap>;
export type TypeOf<T> =
  T extends (new (...args: any) => infer P) ? MapBaseType<P> :
  T extends ((...args: any) => infer PP) ? MapBaseType<PP> :
  _TypeOf<T>;

type _TypeOf<T> = {
  [idx in keyof T]:
  T[idx] extends (new (...args: any) => infer P) ? MapBaseType<P> :
  T[idx] extends ((...args: any) => infer PP) ? MapBaseType<PP> :
  T[idx] extends (infer PPP)[] ? TypeOf<PPP>[]:
  T[idx] extends TypeDef? _TypeOf<T[idx]>:never
}


// 测试部分
const tp = {
  a: Object,
  b: String,
  c:Number,
  h: {
    c: Object
  },
  k: multi([Object, Array, String]),
  // default this declare a type of (number|object)[]
  s: [Object, Number],
  sss:ANY()
};


