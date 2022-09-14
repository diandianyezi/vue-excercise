// patch

import { off } from "process"

// src/vdom/patch.js
export function patch(oldVnode, vnode) {
  const isRealElement = oldVnode.nodeType
  if(isRealElement) {
    // oldVnode是真实dom元素，就代表是初次渲染
  } else {
    // oldVnode是虚拟dom，就是更新过程 使用diff算法
    if(oldVnode.tag !== vnode.tag) {
      // 如果新旧标签不一致 用新的替换旧的，oldVnode.el代表的是真实dom节点--同级比较
      oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el)
    }
    // 如果旧节点是一个文本节点
    if(!oldVnode.tag) {
      if(oldVnode.text !== vnode.text) {
        oldVnode.text = vnode.text
      }
    }
    // 不符合上面两种 代表标签一致并且不是文本节点
    const el = (vnode.el = oldVnode.el)
    updateProperties(vnode, oldVnode.data) // 更新属性
    const oldCh = oldVnode.children || []
    const newCh = vnode.children || []

    if(oldCh.length > 0 && newCh.length > 0) {
      updateChildren(el, oldCh, newCh);
    } else if(oldCh.length) {
      // 新的没有儿子
      el.innerHTML = ''
    } else if(newCh.length) {
      // 新的有儿子
      for(let i = 0; i < newCh.length; i++) {
        const child = newCh[i];
        el.appendChild(createElm(child));
      }
    }
  }
}

// 解析vnode的data属性 映射到真实dom上
function updateProperties(vnode, oldProps = {}) {
  const newProps = vnode.data || {};
  const el = vnode.el;

  for(const k in oldProps) {
    if(!newProps[k]) {
      el.removeAttribute(k)
    }
  }

  // 对style样式做特殊处理 如果新的没有 需要把心的style值置空
  const newStyle = newProps.style || {};
  const oldStyle = oldProps.style || {};

  for(const key in oldStyle) {
    if(!newStyle[key]) {
      el.style[key] = '';
    }
  }

  // 遍历新的属性 进行增加操作
  for(const key in newProps) {
    if(key === 'style' ) {
      for(const styleName in newProps.style) {
        el.style[styleName] = newProps.style[styleName];
      }
    } else if(key === 'class') {
      el.className = newProps.class;
    } else {
      el.setAttribute(key, newProps[key]);
    }
  }
}

function isSameNode(oldVnode, newVnode) {
  return oldVnode.tag === newVnode.tag && oldVnode.key === newVnode.key;
}

function updateChildren(parent, oldCh, newCh) {
  let oldStartIndex = 0;
  let oldStartVnode = oldCh[0];
  let oldEndIndex = oldCh.length - 1;
  let oldEndVnode = oldCh[oldEndIndex];

  let newStartIndex = 0;
  let newStartVnode = newCh[0];
  let newEndIndex = newCh.length - 1;
  let newEndVnode = newCh[newEndIndex];

  // 根据key来创建旧的儿子的index映射表，类似 {'a':0,'b':1} 代表key为'a'的节点在第一个位置 key为'b'的节点在第二个位置
  function makeIndexByKey(children) {
    let map = {};
    children.forEach((item, index) => {
      map[item.key] = index;
    })
    return map
  }

  // 生成的映射表
  let map = makeIndexByKey(oldCh);

  // 只有当新老儿子的双指标的起始位置不大于结束位置的时候  才能循环 一方停止了就需要结束循环
  while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if(!oldStartVnode) {
      oldStartVnode = oldCh[++oldStartIndex];
    } else if(!oldEndVnode) {
      oldEndVnode = oldCh[--oldEndIndex];
    } else if(isSameNode(oldStartVnode, newStartVnode)) {
      // 头和头对比 依次向后追加
      patch(oldStartVnode, newStartVnode); // 递归比较儿子以及他们的子节点
      oldStartVnode = oldCh[++oldStartIndex]
      newStartVnode = newCh[++newStartIndex]
    } else if (isSameNode(oldEndVnode, newEndVnode)) {
      // 尾和尾对比 依次向前追加
      patch(oldEndVnode, newEndVnode);
      oldEndVnode = oldCh[--oldEndIndex];
      newEndVnode = newCH[--newEndIndex];
    } else if(isSameNode(oldStartVnode, newEndVnode)) {
      // 老的头和新的尾相同 把老的头移动到尾部
      patch(oldStartVnode, newEndVnode);
      parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling); 
      oldStartVnode = oldCh[++oldStartIndex];
      newEndVnode = newCH[--newEndIndex];
    } else if(isSameNode(oldEndVnode, newStartVnode)) {
      // 老的尾和新的头一样 把老的尾移动到头部
      patch(oldEndVnode, newStartVnode);
      parent.insertBefore(oldEndVnode.el, oldStartVnode.el);
      oldEndVnode = oldCh[--oldEndIndex];
      newStartVnode = newCh[++newStartIndex];
    } else {
      // 上述四种情况都不满足 则暴力对比
      let moveIndex = map[newStartVnode.key];
      if(!moveIndex) {
        // 老的节点找不到 直接插入
        parent.insertBefore(createElm(newStartVnode), oldStartVnode.el);
      } else {
        let moveVnode = oldCh[moveIndex];
        oldCh[moveIndex] = undefined;
        parent.insertBefore(moveVnode.el, oldStartVnode.el);
        patch(moveVnode, newStartVnode);
      }
    }
  }

  // 如果老节点循环完了，新节点还有 则新节点直接添加到头部或者尾部
  if(newStartIndex <= newEndIndex) {
    for(let i = newStartIndex; i <= newEndIndex; i++) {
      const ele = newCh[newEndIndex + 1] == null ? null : newCh[newEndIndex + 1].el
      parent.insertBefore(createElm(newCh[i], ele))
    }
  }

  // 如果新节点循环完毕 老节点还有 证明老的节点需要直接删除
  if(oldStartIndex <= oldEndIndex) {
    for(let i = oldStartIndex; i <= oldEndIndex; i++) {
      let child = oldCh[i];
      if(child !== undefined) {
        parent.removeChild(child.el);
      }
    }
  }
} 