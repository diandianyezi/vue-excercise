// xhr 取消请求
/**
  * XMLHttpRequest 是一个内建的浏览器对象，允许使用JavaScript发送HTTP请求
  * 如果请求已被发出，可以使用 abort()方法立刻中止请求
*/
const xhr = new XMLHttpRequest();

xhr.open('GET', 'https://xxx');
xhr.send();

xhr.abort()

// fetch Api 取消请求
/**
 * fetch 号称是AJAX的替代品，出现于ES6，它可以发出类似XMLHttpRequest的网络请求。
 * 主要区别在于fetch使用了 promise，要中止fetch发出的请求，需要使用 AbortController。
 */

const controller = new AbortController();
const signal = controller.signal;

fetch('/xxx', {
  signal,
}).then(function(response) {
  //...
})

controller.abort() // 取消请求

// axios取消请求
/**
  * axios 是一个HTTP请求库，
  * 本质是对XMLHttpRequest的封装后基于promise的实现版本，
  * 因此axios请求也可以被取消。
  * 可以使用axios的CancelToken Api取消请求
  */

const source = axios.CancelToken.source();

axios.get('/xxx', {
  cancelToken: source.token
}).then(function(response) {
  //...
})

source.cancel(); // 取消请求

// 在cancel时，axois会在内部调用promise.reject()与xhr.abort()。
// 在处理请求错误时，需判断error是否是cancel导致的，避免与常规错误一起处理。
axios.get('/xxx', {
  cancelToken: source.token
}).catch(function(err) { 
  if (axios.isCancel(err)) {
    console.log('Request canceled', err.message);
  } else {
    // 处理错误
  }
});

/**
 * 但 cancelToken 从 v0.22.0 开始已被 axios 弃用。原因是基于实现该 API 的提案 cancelable promises proposal 已被撤销。
  * 从 v0.22.0 开始，axios 支持以 fetch API 方式的 AbortController 取消请求
*/

const controller1 = new AbortController();

axios.get('/xxx', {
  signal: controller.signal
}).then(function(response) {
   //...
});

controller1.abort() // 取消请求

/**
 * 可取消的promise：基于指令式promise
 * 忽略过期请求：封装一个自动忽略过期请求的高阶函数 onlyResolvesLast
 */

// 在每次发送新请求前，cancel上一次的请求，忽略它的回调
import { createImperativePromise } from 'awesome-imperative-promise';

function onlyResolvesLast(fn) {
  let cancelPrevious = null;

  const wrapperFn = (...args) => {
    cancelPrevious && cancelPrevious();
    // 执行当前请求
    const result = fn.apply(this, args);

    // 创建指令式的promise，暴露cancel方法并保存
    const { promise, cancel } = createImperativePromise(result)
    cancelPrevious = cancel;

    return promise;
  }

  return wrapperFn;
}
// 使用demo
const fn = (duration) => 
  new Promise(r => {    
    setTimeout(r, duration);  
  });

const wrappedFn = onlyResolvesLast(fn);

wrappedFn(500).then(() => console.log(1));
wrappedFn(1000).then(() => console.log(2));
wrappedFn(100).then(() => console.log(3));

// 输出 3