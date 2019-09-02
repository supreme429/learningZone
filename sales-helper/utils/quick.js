/**
 * 存放快捷操作函数
 * eg: requestPost, requestGet, wx.showModal
 */
const { config, env } = require('../config/config.js');

// 重组请求链接
const getRequestUrl = (url, proName = config.proName) => {
  return env.baseUrl + (proName ? proName + '/' : '') + url;
}

const request = (params) => {
  console.log('接口传参：', params.url, params.data);
  return new Promise((resolve, reject) => {
    const defs = {
      url: '',
      method: 'GET',
      data: {},
      success: res => {
        console.log('接口回传参数：', params.url, res.data)
        if (res.statusCode === 200) {
          resolve(res);
        }
      },
      fail: err => {
        if (typeof (reject) == "function") {
          reject();
        } else {
          showToastNone('信息获取失败')
          console.log(err);
        }
      }
    };
    Object.assign(defs, params)
    wx.request(defs);
  })
}

// GET 请求快捷方法
const requestGet = (requectUrl, data) => {
  return request({
    url: getRequestUrl(requectUrl.url, requectUrl.proName),
    data,
    method: 'GET'
  });
}

// POST 请求快捷方法
const requestPost = (requectUrl, data) => {
  return request({
    url: getRequestUrl(requectUrl.url, requectUrl.proName),
    data,
    method: 'POST'
  });
}

const requestAll = (promises) => {
  showLoading();
  Promise.all(promises)
    .then(function () {
      console.log('加载完成了');
      setTimeout(() => {
        wx.hideLoading();
      }, 300)
    });
}

const showToastNone = (title, duration = 1500) => {
  wx.showToast({
    icon: 'none',
    title,
    duration
  });
}

const toggleModal = (title = '', content, confirmCallBack, confirmText = '确定', cancelText = '取消', showCancel = true, cancelCallBack) => {
  wx.showModal({
    title: title,
    content: content,
    showCancel: showCancel,
    cancelText: cancelText,
    confirmText: confirmText,
    cancelColor: '#999',
    confirmColor: '#e62318',
    success: function (res) {
      if (res.confirm) {
        confirmCallBack()
      } else if (res.cancel) {
        if (typeof (cancelCallBack) == 'function') {
          cancelCallBack()
        }
      }
    }
  })
}

const showLoading = (callback) => {
  wx.showLoading({
    success() {
      if (typeof (callback) == "function") {
        callback();
      }
    }
  })
}


module.exports = {
  getRequestUrl: getRequestUrl,
  requestGet: requestGet,
  requestPost: requestPost,
  requestAll: requestAll,
  showToastNone: showToastNone,
  showLoading: showLoading,
  toggleModal: toggleModal,
}