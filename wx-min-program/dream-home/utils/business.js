const quick = require('./quick.js');
/**
 * 新增用户
 * appId, unionId, openId
 */
const addUserInfo = (obj) => {
  quick.requestPost({ url: 'addUserInfo' }, obj);
}
/**
 * 更新用户资料
 * appId, unionId, openId
 */
const updateUserInfo = (obj) => {
  quick.requestPost({ url: 'updateUserInfo' }, obj);
}
/**
 * 记录参与数据
 * openId
 */
const addJoin = (openId) => {
  quick.requestPost({ url: 'addJoin' }, {
    openId
  })
}

/**
 * 记录分享数据
 * openId
 */
const addShare = (openId) => {
  quick.requestPost({ url: 'addShare' }, {
    openId
  })
}

/**
 * 上传图片
 */
const uploadFile = (filePath) => {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: quick.getRequestUrl('up/ntpl/upload', 'dhmina'),
      filePath: filePath,
      name: 'file',
      success(res) {
        resolve(res);
      }
    })
  });
}

/**
 * 获取小程序后台配置信息
 */
const getDhMinaConfig = (app) => {
  quick.requestGet({ url: 'getDhMinaConfig'})
    .then(res => {
      const { code, data } = res.data;
      if(code === 0) {
        app.globalData.minaConfig = {
          shareDesc: data.shareDesc || '',
          sharePicUrl: data.sharePicUrl || '',
          collectionCopy: data.collectionCopy || '',
          collectionPicUrl: data.collectionPicUrl || '',
          // activityLink: data.activityLink || '',
          // activityPicUrl: data.activityPicUrl || '',
          bannerConfigVoList: data.bannerConfigVoList || [],
        }
      }
    })
}

const getUserInfo = (app) => {
  return new Promise((resolve, reject) => {
    quick.requestGet({ url: 'getUserInfo' }, { openId: app.globalData.openId }).then((res) => {
      const { code, data } = res.data;
      resolve(code)
    })
  })
}

const setMinaShareConfig = (app) => {
  return {
    title: app.globalData.minaConfig && app.globalData.minaConfig.shareDesc || '',
    path: '/pages/index/index',
    imageUrl: app.globalData.minaConfig && app.globalData.minaConfig.sharePicUrl || ''
  }
}
module.exports = {
  getDhMinaConfig,
  addUserInfo,
  updateUserInfo,
  addJoin,
  addShare,
  uploadFile,
  getUserInfo,
  setMinaShareConfig,
}