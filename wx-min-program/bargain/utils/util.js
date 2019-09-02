const { mllPublicImgUrl } = require('../config/config.js');
/**
 * 格式转化等处理类操作函数
 */
const getSystemInfo = () => {
  var systemInfo;
  wx.getSystemInfo({
    success: function (res){
      systemInfo = res
    }
  })
  return systemInfo;
}

/**
 * 处理返回数据方法
 * data 返回的数据
 * handles 需要处理的字段
 * {
 *  field: 'price', // 转为价格显示 分->转元
 * }
 */
const handleData = (data, handles) => {
  try {
    if (data) {
      for (let k in handles) {
        if(!data[k]) continue;
        switch (handles[k]) {
          case 'price':
            data[k] = formatPrice(data[k]);
            break;
          case 'json':
            data[k] = formatJson(data[k]);
            break;
          case 'mllImg': 
            data[k] = formatMllImg(data[k]);
            break;
        }
      }
    }
  } catch (err) {
    console.error(err);
  }

  return data;
}

/**
 * handleData 处理数组的方法
 */
const handleDataByArray = (arrData, handles) => {
  try{
    arrData.forEach((data, i) => {
      arrData[i] = handleData(data, handles);
    })
  } catch (err) {
    console.log('handleDataByArrayError', err)
  }

  return arrData;
}

// 解析JSON数据
const formatJson = d => {
  let data = d;
  try {
    data = JSON.parse(d);
  } catch (err) {
  }

  return data;
}

// 为商品详情添加 https://image.meilele.com
const formatMllImg = imgs => {
  let n;
  
  if (typeof (imgs) === 'string' && imgs.split(',').length == 1) {
    n = `${mllPublicImgUrl}${imgs}`;
  } else if (Array.isArray(imgs) || imgs.split(',').length > 1) {
    imgs = Array.isArray(imgs) ? imgs : imgs.split(',');
    n = [];
    imgs.map( val => {
      n.push(val ? `${mllPublicImgUrl}${val}` : '');
    })
  } else {
    n = imgs;
  }

  return n;
}

// 分转元
const formatPrice = n => {
  n = new Number(n) / 100;
  return n === 0 ? 0 : n.toFixed(2);
}

//获取系统信息
const getSystemInfoAsync = () => {
  return new Promise((resolve, reject) => {
    wx.getSystemInfo({
      success: (res) => {
        resolve(res)
      },
    })
  })
}

//获取指定id的dom元素的信息
const getDomInfoById = id => {
  return new Promise((resolve, reject) => {
    wx.createSelectorQuery().select(id).boundingClientRect(function (rect) {
      resolve(rect)
    }).exec()
  })
}

//获取指定id的scrollView的信息
const getScrollInfoById = id => {
  return new Promise((resolve, reject) => {
    wx.createSelectorQuery().select(id).scrollOffset(function (rect) {
      resolve(rect)
    }).exec()
  })
}


module.exports = {
  getSystemInfo,
  getSystemInfoAsync,
  getDomInfoById,
  getScrollInfoById,
  formatPrice,
  formatMllImg,
  handleData,
  handleDataByArray,
}
