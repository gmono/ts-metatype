import { multi, Any, TypeOf, value, validate, ANY, tuple } from '.';

class A{
    constructor(){

    }
    public a:number=1;
}
class B{
    constructor(){

    }
    public a:string="";
}
// 测试部分
const tp = {
    t:Number,
    tt:String,
    s:Object,
    k:tuple([Number,String,Array,A]),
    anyv:Any,
    //基本类型的或类型
    or:[String,Object],
    //非基本类型的或类型 不能和基本类型混同
    ar:[A,B],
  myclass:A
};

type ss<T>={[idx in keyof T]:T[idx]};

type a=ss<(string|object|typeof A)[]>

type MyType = TypeOf<typeof tp>;
let t:MyType={
    myclass:1
}
t.myclass

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