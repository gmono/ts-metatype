# Typescript的运行时类型系统
**将运行时类型定义，校验和编辑时类型提示检测联系起来，基于ts-metacode实现**  
主要功能(打勾表示已经实现):
- [x] 定义运行时类型
- [x] 在开发时提供等同于Typescript类型定义的提示功能（类型生成）
- [x] 使用typedef对value进行校验
  - [x] validate函数提供的结果可以被编辑器用作类型跟踪
- [x] 支持可扩展的类型定义（自定义class）
- [ ] 扩展类型定义
   - [ ] 支持在类型定义中添加默认值
   - [ ] 支持在类型定义中添加Example表（kv对），并支持使用函数直接获取
   - [ ] 支持动态对类型定义添加Example值，并保持类型定义的功能不变
   - [ ] 对添加Example后或Default后的类型定义，支持将添加的值的信息（如key名）添加到类型定义中，并提供编辑时支持
   - [ ] 对不同模态的类型定义实现兼容
- [ ] 支持高阶类型声明
  - [ ] 可选类型
  - [ ] None
  - [ ] 带类型参数的类型（如数组）
  - [ ] 接口（待考虑）
  - [ ] 与或非类型
    - [ ] 或类型
      - [x] 非基本类型的或类型
      - [x] 基本类型的或类型
      - [ ] 混合型的或类型
- [ ] 验证多次映射可行性（类型生成类型生成类型)
# Example
以下为已实现功能的测试
## 静态类型获取
```ts
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
  sss:ANY
};


type MyType = TypeOf<typeof tp>;

// 此时MyType的类型和直接使用interface或type关键字定义的类型一致，支持编译器提示
```
## 编译时数据类型检测
```ts
const tt = {
  a: Object,
  b: String,
  c: {
    d:Number
  }
}
//! 以下代码会报错 d的类型错误，应该为number
const v = value(tt, {
  a: {t:""},
  b: "",
  c: {
    d:"s"
  }
})
```

## 运行时类型校验
```ts
const tt = {
  a: Object,
  b: String,
  c: {
    d:Number
  }
}
//以下代码得到true ，可尝试修改其中数据类型，查看校验结果
console.log(validate(tt, {
  a: {t:""},
  b: "",
  c: {
    d:100
  }
}))
```

# 问题
- [ ] object类型拦截问题，所有不在基本类型表中的类型会被映射为object，限制了可扩展性，这有赖于ts-metacode包的更新改进映射功能
- [ ] ANY类型的定义问题，可能存在隐患（{}别名产生的问题）