// components/loginGetUser/loginGetUser.js
const app = getApp();
const quick = require('../../utils/quick.js');
const { appName } = require('../../config/config.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
  },

  /**
   * 组件的初始数据
   */
  data: {
    appName: appName
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getUserInfo(e) {
      const { nickName, avatarUrl } = e.detail.userInfo;
      const data = {
        openId: app.globalData.openId,
        appId: app.globalData.appId,
        headImgUrl: avatarUrl,
        nickName: nickName,
      };
      console.log('updateDataUser:', data);
      quick.requestPost({ url: 'updateUserInfo' }, data).then(res => {
        const { code, data } = res.data;
        if (code === 0) {
          app.globalData.userShowInfo = {
            headImgUrl: avatarUrl,
            nickName: nickName,
          }

          wx.setStorage({
            key: 'userShowInfo',
            data: app.globalData.userShowInfo,
            success: () => {
              this.triggerEvent('callback');
              this.close();
            }
          })
        }
      })
    },

    close() {
      this.triggerEvent('close');
    }
  }
})
