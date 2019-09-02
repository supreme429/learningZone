/**
 * @ utils/cookie.js
 * @ 获取cookie并写入本地存储
*/

import Config from './config.js';

module.exports = function() {
  let cookie = wx.getStorageSync('ck');
  
  return new Promise((resolve) => {
    if (!cookie) {
      wx.request({
        url: `${Config.baseUrl}/dubbo_api/support/erpwxapp/spCookie`,
        method: 'GET',
        dataType: 'json',
        success: (res) => {
          if (res && res.data) {
            let ecsid = res.data.data.ECS_ID;
            let masi = res.data.data.MA_si;
            let mllcid = res.data.data.MLL_CID;
            let cookie = 'ECS_ID=' + ecsid + ';MA_si=' + masi + ';MLL_CID=' + mllcid;

            wx.setStorageSync('ECS_ID', ecsid);
            wx.setStorageSync('MA_si', masi);
            wx.setStorageSync('MLL_CID', mllcid);
            wx.setStorageSync('ck', cookie);
          }
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}