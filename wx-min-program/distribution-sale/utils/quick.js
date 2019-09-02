/**
 * 存放快捷操作函数
 * eg: requestPost, requestGet, wx.showModal
 */
// GET 请求快捷方法
const requestGet = (requectUrl, data) => {
  return new Promise((resolve, reject) => {
    const app = getApp();
    wx.request({
      url: app.getRequestUrl(requectUrl.url, requectUrl.proName),
      method: 'GET',
      data: data,
      success: res => {
        if (parseInt(res.data.code) !== 0) {
          console.log('接口异常：', requectUrl.url, res.data)
        }
        resolve(res);
      },
      fail: err => {
        if (reject) {
          reject();
        } else {
          showToastNone('信息获取失败')
          console.log(err);
        }
      }
    })
  })
}

// POST 请求快捷方法
const requestPost = (requectUrl, data) => {
  return new Promise((resolve, reject) => {
    const app = getApp();
    wx.request({
      url: app.getRequestUrl(requectUrl.url, requectUrl.proName),
      method: 'POST',
      // header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: data,
      success: res => {
        if (parseInt(res.data.code) !== 0) {
          console.log('接口异常：', requectUrl.url, res.data)
        }
        resolve(res)
      },
      fail: err => {
        if (reject) {
          reject();
        } else {
          showToastNone('信息获取失败')
          console.log(err);
        }
      }
    })
  })
}

//弹框
const toggleModal = (title = '', content, confirmCallBack, confirmText = '确定', cancelText = '取消', cancelCallBack) => {
  wx.showModal({
    title: title,
    content: content,
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

const showToastNone = title => {
  wx.showToast({
    icon: 'none',
    title: title,
  });
}

module.exports = {
  requestGet: requestGet,
  requestPost: requestPost,
  showToastNone: showToastNone,
  toggleModal: toggleModal
}