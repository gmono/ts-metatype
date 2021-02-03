import type { MapTypeLong } from "ts-metacode";

const DefaultSym = Symbol("默认值");
/**
 * 自定义类型的默认值装饰器，用于让默认值生成器自动生成默认值
 * @param value 默认值
 */
export function DefaultValue<T>(value: T) {
  return (target: T) => {
    (target as any)[DefaultSym] = value;
  };
}
//定义类型
// 功能 校验 生成默认值  编辑(setValue函数 自带校验) 生成类型
//使用构造器定义内心类型
//类型即构造器 任何构造器都可以用于类型 校验使用instanceof来进行
/**
 * 表示一个复杂类型定义，一般等同于一个类的定义，其定义了一个对象
 */
export type ComplexTypeDef = { [idx: string]: TypeDef };
/**
 * 一般类型定义，主要类型定义，可以是基本类型和复杂类型，可以是自定义构造器和返回某一类型的函数
 * 是本包的基础
 */
export type TypeDef = ComplexTypeDef | Function|Function[];
//keys表示里面有的key
/**
 * 带值列表的类型定义，其中所有的值都是经过了校验函数校验的值，包括静态校验和动态校验
 * 但目前只执行静态校验
 */
export type TypeDefWithValue<T extends TypeDef, keys = never> = {
  __typedef__: T;
  __valueMap__: Map<string, TypeOf<T>>;
};
//用来取typedefwithvalue中的类型
type InnerTypedef<
  T extends TypeDefWithValue<any, any>
> = T extends TypeDefWithValue<infer P, any> ? P : never;
type InnerKeys<
  T extends TypeDefWithValue<any, any>
> = T extends TypeDefWithValue<any, infer P> ? P : never;
//保留值 用于标识默认值
export const Default = "__default__";


const AtomTypeList=new Map<Function,any>();
export function generateDefault<T extends TypeDef>(type: T) {
  //生成
  //关键是要得到每个原子类型的默认值
  //默认原子类型 和自定义类型的默认值
  //应当允许自定义类型附加默认值 在class的元数据上
  //使用default装饰器
  if (type instanceof Function) {
    //自定义类型 取默认值 原子类型 直接取预设值
    if(AtomTypeList.has(type)){
      //原子类型
      return AtomTypeList.get(type);
    }
    //自定义类型
    if(DefaultSym in type) return (type as any)[DefaultSym];
    return null;
  } else {
    //如果是复杂类型 递归
    let now: any = {};
    for (let k in type) {
      let Type = type[k];
      now[k] = generateDefault(Type as any);
    }
  }
}

/**
 * 创建一个带有值的类型定义
 */
export function useValue<T extends TypeDef>(
  type: T
): TypeDefWithValue<T, never> {
  return {
    __typedef__: type,
    __valueMap__: new Map(),
  };
}
/**
 * 设置一个键值对到类型定义上
 * @param type 类型定义
 * @param key 键
 * @param value 值
 */
export function setValue<T extends TypeDefWithValue<any>, K extends string>(
  type: T,
  key: K,
  value: TypeOf<T>
): K extends InnerKeys<T>
  ? TypeDefWithValue<InnerTypedef<T>, InnerKeys<T>>
  : TypeDefWithValue<InnerTypedef<T>, InnerKeys<T> | K> {
  //设置值
  type.__valueMap__.set(key, value);
  return type as any;
}
//typeof TT ->keyof === TT-> keyof
//keyof TT和keyof TypeOf<TT> 应该是一样的
//不能像一般的typedef一样直接取children 要使用特殊函数来让value一起取得
export function sub<
  TT extends ComplexTypeDef,
  T extends TypeDefWithValue<TT>,
  K extends keyof TT
>(type: T, key: K): TypeDefWithValue<TT[K], InnerKeys<T>> {
  let tf = type.__typedef__[key];
  let subvalues = new Map();
  type.__valueMap__.forEach((value, sign: string) =>
    subvalues.set(sign, value[key as keyof TypeOf<TT>])
  );
  return {
    __typedef__: tf,
    __valueMap__: subvalues,
  };
}

export function getValue<
  T extends TypeDefWithValue<any>,
  K extends InnerKeys<T>
>(type: T, key: K) {
  return type.__valueMap__.get(key as string);
}
//快捷函数
export const withDefault = <T extends TypeDefWithValue<any>>(
  type: T,
  value: TypeOf<T>
) => setValue(type, Default, value);
export const useDefault = <T extends TypeDef>(
  type: T,
  defaultValue: TypeOf<T>
) => withDefault(useValue(type), defaultValue);
export function getDefault() {
  //如果存在default就返回 如果不存在使用默认default
  // generateDefault
}
// 基本类型映射表
// 请勿改变顺序！
//! object拦截问题  尚未解决
// 解决拦截问题 通过对constructor进行特殊处理 而不是映射出的类型
//更改映射表
type BaseTypeMap = [
  [StringConstructor, string],
  [NumberConstructor, number],
  [ObjectConstructor, object],
  [ArrayConstructor, any[]],
  //这是没有映射到的情况 因此any类型被占用
  [any, never]
];

export function Any(): any {
  //构造器返回的应该是默认值
  return null;
}
export { Any as ANY };
/**
 * 用于声明元组,不使用此函数声明的则是或类型数组
 * @param sth 元组
 */
export function multi<T extends any[] | [any, ...any[]]>(sth: T): T {
  return sth;
}
export { multi as tuple };

//工具函数 所有工具函数都只针对原始的类型定义对象  带值的应该使用高阶函数包装
/**
 * 实际在运行时校验一个类型和数据
 * @param typedef 类型定义
 * @param value 值
 */
export function validate<T extends TypeDef>(
  typedef: T,
  value: TypeOf<T>
): value is TypeOf<T> {
  // 每一个成员都校验成功
  // 原生类型需要使用typeof判断
  const tp = typedef as any;
  //和上面的basetype映射对应
  const rawMap = {
    string: String,
    number: Number,
    object: Object,
    //array这里不算是基本类型 不需要使用typeof判断 而是使用instanceof
  };
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
  if (typedef instanceof Array) {
    //或类型 验证其中的所有类型 只要有一个正确就可以
    let ok = false;
    for (let tt of typedef) {
      if (validate(tt, value)) {
        ok = true;
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
export function value<T extends TypeDef>(
  typedef: T,
  value: TypeOf<T>,
  full = false
) {
  return value;
}

// 类型提取器
//类型提取系统
// 请勿修改以便避免奇怪的结果
type MapBaseType<Cons> = MapTypeLong<Cons, BaseTypeMap>;
// 如果是对象直接开始对象映射
//广义TypeOf 可以处理带有默认值的类型定义
export type TypeOf<T> = T extends TypeDefWithValue<any>
  ? RawTypeOf<T["__typedef__"]>
  : RawTypeOf<T>;

type RawTypeOf<T> =
  //! 这里有联合类型映射问题 在或类型映射的时候，会统一进行basetype映射
  //! 只要有一个类型映射出来，就不为空，则其他无法映射出的类型会被忽略
  //! 因此只要有一个可以映射出结果的类型就会自动顶替掉其他类型 这里对或类型要单独处理
  //! 必须要先提取再映射 把或类型提取到一个元祖类型，然后对元组类型进行映射后合并
  //T的三种情况 1 对象需要进行对象映射 2构造器且basemap出never，进行构造器映射，3 构造器且映射出非never ，则直接返回
  //构造器映射 先进行基础类型转换 转换成功就不是构造器而是number string等，不成功就是never
  //如果失败 对其进行构造器映射 如果成功 直接返回基础映射结果
  MapBaseType<T> extends never ? _Type<T> : MapBaseType<T>;
// 构造器与对象映射
type _Type<T> =
  //如果是构造器就返回结果 否则就当对象处理
  T extends new (...args: any) => infer P
    ? P
    : T extends (...args: any) => infer PP
    ? PP
    : __Type<T>;
//对象映射
type __Type<T> = {
  [idx in keyof T]: TypeOf<T[idx]>;
};
