//app.js
const business = require('./utils/business.js');

App({
  globalData: {
    appId: '',
    keywords: [],
    searchWord: '',
  },
  onShow() {
    // 检测网络状况
    business.getNetwordType();
    this.globalData.appId = wx.getAccountInfoSync().miniProgram.appId;
    business.getSearchHotKey(this);
  }
})