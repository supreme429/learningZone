/**
 * @ utils/ajax.js
 * @ 封装ajax请求
 * @ 所有的请求都需要调用ajax方法
 * @ 正常的数据请求接口，需要依赖cookie和用户信息
*/

import Cookie from './cookie.js';
import Login from './login.js';

module.exports = function (requestConfig) {
    let cookie = wx.getStorageSync('ck');

    // 所有的接口都需要带上cookie

    Cookie().then(() => {
        return Login();
    }).then(({ userId, is_visitor}) => {
        cookie = wx.getStorageSync('ck');
        requestConfig.header = {
            'responseType': 'application/json',
            'content-type': 'application/x-www-form-urlencoded',
            'Cookie': cookie
        };
        wx.request({
            url: requestConfig.url,
            header: requestConfig.header,
            method: requestConfig.method,
            data: Object.assign({}, requestConfig.data,{userId}),
            dataType: requestConfig.dataType,
            responseType: requestConfig.responseType,
            // 因为微信的request方法本身返回了data节点，这里少反一层
            success: (res) => {
                requestConfig.success(res.data, is_visitor);
            },
            fail: requestConfig.fail,
            complete: requestConfig.complete
        });
    });
};
