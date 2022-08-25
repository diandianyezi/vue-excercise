const getList = () => {
  return new Promise((resolve, reject) => {
    var ajax = new XMLHttpRequest();
    ajax.open('get', 'http://localhost:3001');
    ajax.send();
    ajax.onreadystatechange = function() {
      if(ajax.readyState == 4 && ajax.status == 200) {
        resolve(JSON.parse(ajax.responseText))
      }
    }
  })
}

const container = document.getElementById('container');

// 直接渲染: 太卡
// const renderList = async() => {
//   const list = await getList();

//   list.forEach(item => {
//     const div = document.createElement('div');
//     div.className = 'sunshine';
//     div.innerHTML = `
//       <img src="${item.src}"/><span>${item.text}</span>
//     `
//     container.appendChild(div)
//   });
// }

// renderList()
// 第一种优化方案：分页
// 第二种 requestAnimationFrame 代替setTimeout。减少reflow次数，提高性能
// window.requestAnimationFrame 告诉浏览器希望执行邓华，并请求浏览器调用指定函数在下一次重绘之前更新动画。
// 第三种 文档片段

const renderList = async() => {
  console.time('time')
  const list = await getList();

  const total = list.length;
  const page = 0;
  const limit = 200;
  const totalPage = Math.ceil(total/limit);

  const render = (page) => {
    if(page >= totalPage) return

    requestAnimationFrame(() => {
      const fragment = document.createDocumentFragment();

      for(let i = page * limit; i < page * limit + limit; i++) {
        const item = list[i]
        const div = document.createElement('div');
        div.className = 'sunshine';
        div.innerHTML = `
          <img src="${item.src}"/><span>${item.text}</span>
        `
        // container.appendChild(div)
        fragment.appendChild(div)
      }
      container.appendChild(fragment);
      render(page+1)
    })
  }

  render(page)
  console.timeEnd('time')
}

renderList()

// 延迟加载的方法：根据用户的滚动位置动态渲染数据  见lazy-load.vue
