/**
 * 存放公用的业务逻辑
 */

const quick = require('./quick.js');

const goPageLogin = () => {
  wx.redirectTo({
    url: '/pages/login/login',
  });
}

// 检验用户是否已通过认证
const checkCertification = () => {
  setTimeout(() => {
    const app = getApp();
    if (app.globalData.isCertification) return;
    
    quick.requestGet({ url: 'checkUserStatus' }, { userName: app.globalData.userShowInfo.name }).then(res => {
      const { code, data } = res.data;
      app.globalData.isCertification = code === 0 ? true : false;
    })
  }, 0)
}

module.exports = {
  goPageLogin: goPageLogin,
  checkCertification: checkCertification,
}