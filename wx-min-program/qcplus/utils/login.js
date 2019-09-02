/**
 * @ utils/login.js
 * @ 获取用户登录信息
 */

import Config from './config.js';

module.exports = function() {
     let userid = wx.getStorageSync('user_id');
     let unionid = wx.getStorageSync('union_id');
     let visitor = wx.getStorageSync('is_visitor');
    
    return new Promise((resolve) => {
        if (!userid || !unionid) {
            let cookie = wx.getStorageSync('ck');
            wx.login({
                success(res) {
                    if (res.code) {
                        wx.request({
                            url: `${Config.baseUrl}/dubbo_api/support/erpwxapp/autoLogin?code=${res.code}`,
                            method: 'GET',
                            header: {
                                'Cookie': cookie
                            },
                            dataType: 'json',
                            success: (json) => {
                                if (json && json.data && json.data.data) {
                                    let unionid = json.data.data.unionid;
                                    let userid = json.data.data.user_id;
                                    let visitor = json.data.data.is_visitor;

                                    wx.setStorageSync('union_id', unionid);
                                    wx.setStorageSync('user_id', userid);
                                    wx.setStorageSync('is_visitor', visitor);

                                    resolve({ 'userId': userid, 'is_visitor': visitor});
                                }
                            }
                        });
                    }
                }
            });
        } else {
            resolve({ 'userId': userid, 'is_visitor': visitor});
        }
    });
}