// 获取短信验证码
const getCapCodeSrc = (openId) => {
  const app = getApp();
  return app.getRequestUrl('ntpl/code/captcha-image', 'damina') + '?openId=' + openId + '&t=' + new Date().getTime();  
}

module.exports = {
  getCapCodeSrc: getCapCodeSrc,
}
