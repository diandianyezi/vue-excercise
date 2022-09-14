// 对象的数据劫持
class Observer {
  constructor(value) {
    Object.defineProperty(value, "__ob__", {
      //  值指代的就是Observer的实例
      value: this,
      //  不可枚举
      enumerable: false,
      writable: true,
      configurable: true,
    });
    // 对数据处理
    if(Array.isArray(value)) {
      value.__proto__ = arrayMethods;
      this.observerArray(value);
    } else {
      this.walk(value);
    }
  }
  observeArray(items) {
    for (let i = 0; i < items.length; i++) {
      observe(items[i]);
    }
  }

  walk(data) {
    let keys = Object.keys(data);
    for(let i = 0; i<keys.length; i++) {
      let key = keys[i];
      let value = data[key];
      defineReactive(data, key, value);
    }
  }
}

function defineReactive(data, key, value) {
  observer(value); // 递归关键
  
  Object.defineProperty(data, key, {
    // 对象新增或者删除的属性无法被 set 监听到 只有对象本身存在的属性修改才会被劫持
    get() {
      console.info('获取值');
      return value
    },
    set(newValue) {
      if(newValue === value) return;
      console.log('设置值')
      // 在set里通知视图更新
      value = newValue
    }
  })
}

export function observer(value) {
  if(Object.prototype.toString.call(value) === '[object Object]' || Array.isArray(value)) {
    return new Observer(value);
  }
}


// Vue如何检测数据变化
// src/obserber/array.js
// 先保留数组原型
const arrayProto = Array.prototype;
// 然后将arrayMethods继承自数组原型
// 这里是面向切片编程思想（AOP）--不破坏封装的前提下，动态的扩展功能
export const arrayMethods = Object.create(arrayProto);
let methodsToPatch = [
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "reverse",
  "sort",
];
methodsToPatch.forEach((method) => {
  arrayMethods[method] = function (...args) {
    //   这里保留原型方法的执行结果
    const result = arrayProto[method].apply(this, args);
    // 这句话是关键
    // this代表的就是数据本身 比如数据是{a:[1,2,3]} 那么我们使用a.push(4)  this就是a  ob就是a.__ob__ 这个属性就是上段代码增加的 代表的是该数据已经被响应式观察过了指向Observer实例
    const ob = this.__ob__;

    // 这里的标志就是代表数组有新增操作
    let inserted;
    switch (method) {
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2);
      default:
        break;
    }
    // 如果有新增的元素 inserted是一个数组 调用Observer实例的observeArray对数组每一项进行观测
    if (inserted) ob.observeArray(inserted);
    // 之后咱们还可以在这里检测到数组改变了之后从而触发视图更新的操作--后续源码会揭晓
    return result;
  };
});