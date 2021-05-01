/**
 * @description 防抖：等待时间内触发更新等待时间
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @example debounce(() => this.example(), 100)
 * @returns {*}
 */

export function debounce(func, wait, immediate) {
  let timestamp, timeout, result, context, args

  const later = function () {
    // 距离上次触发时间间隔
    const interval = +new Date() - timestamp

    /* 
      上次调用时间间隔interval小于等待时间wait，
      重复设置延时直至间隔时间大于等待时间
    */
    if (interval < wait && interval > 0) {
      timeout = setTimeout(later, wait - interval)
    } else {
      timeout = null
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args)
        if (!timeout) context = args = null
      }
    }
  }

  return function (...args) {
    context = this // this指向debounce
    timestamp = +new Date() // 每次触发事件重新获取时间戳
    const callNow = immediate && !timeout
    /* 
      如果延时不存在则重新设定延时
      存在则执行未执行的later函数
      lagter函数排队执行，timestamp是结束关键
    */
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      // 立即执行func函数
      result = func.apply(context, args)
      context = args = null
    }

    return result
  }
}

/**
 * @description 节流: 等待固定时间后调用
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @example throttle(() => this.example(), 100)
 * @returns {*}
 */
export function throttle(func, wait, immediate) {
  let context, result, timeout, context, args

  const later = function () {
    clearTimeout(timeout)
    timeout = null
    if (!immediate) {
      result = func.apply(context, args)
      if (!timeout) context = args = null
    }
  }

  return function (...args) {
    context = this
    const callNow = immediate && !timeout
    if (callNow) {
      func.apply(context, args)
      context = args = null
    }
    // wait时间后清楚计时器执行函数
    if (!timeout) timeout = setTimeout(later, wait)
    return result
  }
}

/**
 * @description 深克隆
 */

