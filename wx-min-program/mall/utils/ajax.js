import Cookie from 'cookie.js';
module.exports = function(config) {
  var cookies = wx.getStorageSync('COOKIE');

  let headerDefined = {
    'content-type': 'application/json',
    'Cookie': cookies
  };
  let header = Object.assign(headerDefined, config.header);  
  let data
  if (config.data && config.data.string_type){
    delete config.data.string_type
    data = JSON.stringify(config.data)
    console.log(data)
  }else{
    data = Object.assign({
      iVersion: '1.0'
    }, config.data);  

  }
  
  let setting = {
    url: config.url ? config.url : '',
    data: data,
    method: config.method ? config.method : 'GET',
    dataType: config.dataType ? config.dataType : 'json',
    header: header,
    success: config.success ? config.success : function () { },
    fail: config.fail ? config.fail : function () { }
  };
  if (!cookies){
    Cookie().then(data => {
      setting.header.Cookie = data
      wx.request(setting);
    })
  }else{
    wx.request(setting);
  }
  
}