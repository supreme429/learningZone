const { config, appNum, env } = require('../config/config.js');
const quick = require('./quick.js');
/**
 * 新增用户
 * appId, unionId, openId
 */
const addUserInfo = (obj, userInfo) => {
  let o = {
    appId: wx.getAccountInfoSync().miniProgram.appId,
    appType: "shmina",
  };
  Object.assign(o, obj);
  if(userInfo) {
    const { avatarUrl, nickName, gender, country, province, city } = userInfo || {};
    Object.assign(o, {
      headImgUrl: avatarUrl || '',
      nickName: nickName || '',
      sex: gender || 0,
    });
  }
  
  quick.requestPost({ url: 'wxapp/addUserInfo', proName: env.proxy }, o);
}

module.exports = {
  addUserInfo
}