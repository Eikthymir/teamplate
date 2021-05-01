Math.easeInOutQuad = function(t, s, c, d) {
  t /= d / 2
  if (t < 1) {
    return c / 2 * t * t + s
  }
  t--
  return -c / 2 * (t * (t - 2) - 1) + s
}

// 调用实现动画API，减少资源占用 http://goo.gl/sx5sts
var requestAnimFrame = (function() {
  return window.requestAnimFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) { window.setTimeout(callback, 1000 / 60)}
})

/**
 * @param {number} amount
 */
function move(amount) {
  document.documentElement.scrollTop = amount
  document.body.parentNode.scrollTop = amount
  document.body.scrollTop = amount
}

function position() {
  return document.documentElement.scrollTop || document.body.parentNode.scrollTop || document.body.scrollTop
}

/**
 * @param {number} to
 * @param {number} duration
 * @param {Function} callback
 */
export function scrollTo(to, duration, callback) {
  const start = position()
  const change = to - start
  const increment = 20
  let currentTime = 0
  duration = (typeof (duration) === 'undefined') ? 500 : duration
  var animateScroll = function() {
    // 执行滚动动画一次增加的时间
    currentTime += increment
    // 用二次缓进缓出函数求移动值，实现缓慢开始滚动，缓慢结束滚动
    var val = Math.easeInOutQuad(currentTime, start, change, duration)
    // 移动doucument.body
    move(val)
    // 当前时间大于等于动画执行持续时间，执行动画结束
    if (currentTime < duration) {
      requestAnimFrame(animateScroll)
    } else {
      if (callback && typeof (callback) === 'function') {
        // 动画完成后执行回调
        callback()
      }
    }
  }
  animateScroll()
}
