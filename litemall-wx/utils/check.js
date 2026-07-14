/**
 * 校验中国大陆手机号：1 开头的 11 位数字（与后端 RegexUtil.isMobileSimple 一致）
 */
function isValidPhone(str) {
  return /^[1]\d{10}$/.test(str);
}

module.exports = {
  isValidPhone
}