const { minEnvVersion, miniWhiteList, miniSource } = require('../config/config.js');
/**
 * 重组页面路由
 * @param page 
 * @param options eg:['a=1','b=2']
 */
const router = (page, options = []) => {
  let url = `/pages/${page}/${page}?${options.join('&')}`;
  return url;
}

/**
 * 跳转到其他小程序 
 * @param path 页面链接
 * @param mini 跳转的小程序 参照 config.js -> miniWhiteList
 */
const goOtherMini = (path, mini = 'mllShop', ) => {
  if (!path) return;
  console.log(`${path}${path.indexOf('?') === -1 ? '?' : '&'}source=${miniSource}`)
  wx.navigateToMiniProgram({
    appId: miniWhiteList[mini],
    path: `${path}${ path.indexOf('?') === -1 ? '?' : '&' }source=${miniSource}`,
    envVersion: minEnvVersion
  })
}

module.exports = {
  router,
  goOtherMini
}