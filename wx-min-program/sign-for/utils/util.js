/**
 * 判断是否超过限定小时数
 * @param int time 离开时间 【时间戳】
 * @param int limitHour 限制时长
 */ 
const overTimeLimit = (time, limitHour) => {
  const nowTime = new Date().getTime();
  return nowTime - time > limitHour * 3600 * 1000 ? true : false;
}

module.exports = {
  overTimeLimit
}
