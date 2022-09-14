// 防抖
function debounce(fn, delay=300) {
  //默认300毫秒
  let timer;
  return function() {
    var args = arguments;
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this, args); // 改变this指向为调用debounce所指的对象
    }, delay);
  };
}

window.addEventListener(
  "scroll",
  debance(() => {
    console.log(111);
  }, 1000)
);

// 节流
//方法一：设置一个标志
function throttle(fn, delay) {
  let flag = true;
  return () => {
    if (!flag) return;
    flag = false;
    timer = setTimeout(() => {
      fn();
      flag = true;
    }, delay);
  };
}
//方法二：使用时间戳
function throttle(fn, delay) {
  let startTime = new Date();
  return () => {
    let endTime = new Date();
    if (endTime - startTime >= delay) {
      fn();
      startTime = endTime;
    } else {
      return;
    }
  };
}
window.addEventListener(
  "scroll",
  throttle(() => {
    console.log(111);
  }, 1000)
);