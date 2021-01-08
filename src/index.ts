import type { MapTypeLong } from "ts-metacode";
//定义类型
// 功能 校验 生成默认值  编辑(setValue函数 自带校验) 生成类型
//使用构造器定义内心类型
//类型即构造器 任何构造器都可以用于类型 校验使用instanceof来进行
export type TypeDef = { [idx: string]: TypeDef } | Function[] | Function;
// 基本类型映射表
// 请勿改变顺序！
//! object拦截问题  尚未解决
type BaseTypeMap = [
  [String, string],
  [Number, number],
  [any[], any[]],
  [ANYTYPE,any],
  [Object, object],
]

// ANY类型的定义扩展了 原生类型的范围
type ANYTYPE = {};
export function ANY():ANYTYPE{
  //构造器返回的应该是默认值
  return {};
}
type Any = typeof ANY;
/**
 * 用于声明元组,不使用此函数声明的则是或类型数组
 * @param sth 元组
 */
export function multi<T extends any[]|[any,...any[]]>(sth: T): T{
  return sth;
}


//工具函数
export function validate<T extends TypeDef>(typedef: T, value: TypeOf<T>): value is TypeOf<T> {
  // 每一个成员都校验成功
  // 原生类型需要使用typeof判断
  const tp = typedef as any;
  const rawMap = {
    string: String,
    number: Number
  }
  for (let k in rawMap) {
    if (typeof value == k) return tp == rawMap[k];
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
    const v = value as any;
    for (let k in typedef) {
      //没提供值就是undefined
      //! 这里要处理v本身是null和undefined的情况
      if (!validate(tp[k], v[k])) return false;
    }
    return true;
  }
}

/**
 * 取值，可提供类型校验 如 value(type,{xxxx}) 会启动编译时的类型监测
 * @param typedef 类型定义
 * @param value 值
 * @param full 未完成，full表示是否按结构填充默认值，即在没有提供值的时候给与补全
 */
export function value<T extends TypeDef>(typedef: T, value: TypeOf<T>,full=false) {
  return value;
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



// // 测试部分
// const tp = {
//   a: Object,
//   b: String,
//   c:Number,
//   h: {
//     c: Object
//   },
//   k: multi([Object, Array, String]),
//   // default this declare a type of (number|object)[]
//   s: [Object, Number],
//   sss:ANY
// };


// type MyType = TypeOf<typeof tp>;


// const tt = {
//   a: Object,
//   b: String,
//   c: {
//     d:Number
//   }
// }

// const v = value(tt, {
//   a: {t:""},
//   b: "",
//   c: {
//     d:"s"
//   }
// })
// console.log(validate(tt, {
//   a: {t:""},
//   b: "",
//   c: {
//     d:100
//   }
// }))