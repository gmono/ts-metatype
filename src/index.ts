import type { MapTypeLong } from "ts-metacode";
//定义类型
// 功能 校验 生成默认值  编辑(setValue函数 自带校验) 生成类型
//使用构造器定义内心类型
//类型即构造器 任何构造器都可以用于类型 校验使用instanceof来进行
export type TypeDef = { [idx: string]: TypeDef } | Function[] | Function;
// 基本类型映射表
// 请勿改变顺序！
//! object拦截问题  尚未解决
// 解决拦截问题 通过对constructor进行特殊处理 而不是映射出的类型
//更改映射表
type BaseTypeMap = [
  [StringConstructor, string],
  [NumberConstructor, number],
  [ObjectConstructor, object],
  [ArrayConstructor,any[]],
  //这是没有映射到的情况 因此any类型被占用
  [any,never]
]

export function Any():any{
  //构造器返回的应该是默认值
  return null;
}
export {Any as ANY};
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
  //和上面的basetype映射对应
  const rawMap = {
    string: String,
    number: Number,
    object:Object,
    //array这里不算是基本类型 不需要使用typeof判断 而是使用instanceof
  }
  for (let k in rawMap) {
    if (typeof value == k) return tp == rawMap[k as keyof typeof rawMap];
  }
  //到这里说明没找到 不是原生类型  使用instanceof判断实例是否归属构造器
  if (typeof typedef == "function") {
    // 构造器或构造函数
    // 这里可以自动追溯 在原型链上
    return value instanceof tp;
  }
  //! 这里是xxx[]的情况 (xxx|xxx)[] 和[xxx,yyy]的情况
  // 如果是简单的数组 是或类型 如果是一个tupleType对象 则是元组类型
  //! 这里需要multi函数做特殊处理 类型映射对multi的特殊处理进行兼容
  if(typedef instanceof Array){
    //或类型 验证其中的所有类型 只要有一个正确就可以
    let ok=false;
    for(let tt of typedef){
      if(validate(tt,value)){
        ok=true;
        break;
      }
    }
    return ok;
  }
  //与类型 和或相反  有待实现
  // 这里是嵌套的情况 即如果是一个对象代表需要递归处理
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
  return false;
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
type MapBaseType<Cons> = MapTypeLong<Cons, BaseTypeMap>;
// 如果是对象直接开始对象映射
export type TypeOf<T>=
//! 这里有联合类型映射问题 在或类型映射的时候，会统一进行basetype映射
//! 只要有一个类型映射出来，就不为空，则其他无法映射出的类型会被忽略
//! 因此只要有一个可以映射出结果的类型就会自动顶替掉其他类型 这里对或类型要单独处理
//! 必须要先提取再映射 把或类型提取到一个元祖类型，然后对元组类型进行映射后合并
//T的三种情况 1 对象需要进行对象映射 2构造器且basemap出never，进行构造器映射，3 构造器且映射出非never ，则直接返回
//构造器映射 先进行基础类型转换 转换成功就不是构造器而是number string等，不成功就是never
//如果失败 对其进行构造器映射 如果成功 直接返回基础映射结果
MapBaseType<T> extends never? _Type<T>:
MapBaseType<T>;
// 构造器与对象映射
type _Type<T>=
//如果是构造器就返回结果 否则就当对象处理
T extends (new (...args: any) => infer P) ? P :
T extends ((...args: any) => infer PP) ? PP :
__Type<T>;
//对象映射
type __Type<T>={
  [idx in keyof T]:TypeOf<T[idx]>
}

type a=MapBaseType<(StringConstructor|object)>



