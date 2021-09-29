/**
 * @description 格式化秒
 * @param {Number} result
 */
export function formatSeconds(result) {
  const h = Math.floor(result / 3600) < 10 ? `0${Math.floor(result / 3600)}` : Math.floor(result / 3600)
  const m = Math.floor((result / 60 % 60)) < 10 ? `0${Math.floor((result / 60 % 60))}` : Math.floor((result / 60 % 60))
  const s = Math.floor((result % 60)) < 10 ? `0${Math.floor((result % 60))}` : Math.floor((result % 60))
  return h !== '00' ? `${h}:${m}:${s}` : `${m}:${s}`
}
