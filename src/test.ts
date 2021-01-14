import { multi, Any, TypeOf, value, validate, ANY } from '.';

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


const tt = {
  a: Object,
  b: String,
  c: {
    d:Number
  }
}

const v = value(tt, {
  a: {t:""},
  b: "",
  c: {
    d:"s"
  }
})
console.log(validate(tt, {
  a: {t:""},
  b: "",
  c: {
    d:100
  }
}))