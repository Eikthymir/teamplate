/**
 * @description 校验是否存在cls的class类名
 * \\s|^ 表示什么都没有（起始位置）或者空白符
 * \\s|$ 表示什么都没有（结束位置）或者空白符
 * @param {HTMLElement} ele
 * @param {string} cls
 * @returns {boolean}
 */
export function hasClass(ele, cls) {
  return !!ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'))
}

/**
 * @description 为元素的class属性添加cls类名
 * @param {HTMLElement} ele
 * @param {string} cls
 */
export function addClass(ele, cls) {
  if (!hasClass(ele, cls)) ele.className += ' ' + cls 
}

/**
 * @description 移除元素的class属性cls类名
 * @param {HTMLElement} ele
 * @param {string} cls
 */
 export function addClass(ele, cls) {
   if (hasClass(ele, cls)) {
     const reg = new RegExp('(\\s|^)' + cls + '(\\s|$)')
     ele.className = ele.className.replace(reg, ' ')
  }
}

/**
 * @description 动态切换添加className达到变换主题效果
 * @param {HTMLElement} element
 * @param {string} className
 */
 export function toggleClass(element, className) {
  if (!element || !className) {
    return
  }
  let classString = element.className
  const nameIndex = classString.indexOf(className)
  // 不存在传入的className，直接拼接添加
  if (nameIndex === -1) {
    classString += ' ' + className
  } else {
    // 存在，则移除此className并拼接前后
    classString =
      classString.substr(0, nameIndex) +
      classString.substr(nameIndex + className.length)
  }
  element.className = classString
}

