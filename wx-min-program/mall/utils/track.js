/*==================================================
 * project: meilele mall min-program 
 * author: leihao
 * createTime: 2018/11/06
 * file: track.js
 * description: 跟踪代码
 ==================================================*/

import config from 'config.js';
import ajax from 'ajax.js';
 

// 定义
var _ana = [];

_ana.baseData = _ana.baseData || {};
_ana.paramData = _ana.paramData || {};
_ana.baseTime = _ana.baseTime || new Date().getTime();

// 定义fn对象
_ana.fn = {

  // 页面基本浏览事件
  trackView: function() {
    var arg = [];

    arg[0] = 'view';
    arg[1] = new Date().getTime() - _ana.baseTime;
    arg[2] = wx.getStorageSync('mobile');

    _ana.track.apply(_ana, arg);
  },

  // 追踪事件
  trackEvent: function() {
    var arg = arguments;
    _ana.track.apply(_ana, arg);
  },

  // 设置参数
  setParam: function() {
    var arg = arguments;
    _ana.paramData[arguments[0]] = arguments[1];
  },

  // 获取页面路由
  getRouter: function () {
    const pages = getCurrentPages();
    console.log('pages', pages)
    let prePage = (pages.length - 1) > 0 ? pages[pages.length - 2] : null //上一个页面
    let currPage = pages[pages.length - 1]

    return {
      current: (currPage && currPage.route) ? currPage.route : '',
      prev: (prePage && prePage.route) ? prePage.route : ''
    };
  }

 };

// 追踪方法
_ana.track = function() {
  var tmpArg = arguments; 
  var tmpParam = [];
  var arg = [];
  
  _ana.getBaseData();

  for (var k in _ana.paramData) {
    _ana.baseData[k] = _ana.paramData[k];
  }

  for (var k = 0; k < tmpArg.length; k++) {
    arg[k] = (tmpArg[k] + "").replace(/\*/g, "+");
  }
  
  if (arg && arg.length) {
    _ana.baseData.ent = Array.prototype.shift.apply(arg); 
    _ana.baseData.fld = Array.prototype.join.apply(arg, ["*"]); 
  }
  _ana.baseData._ = new Date().getTime().toString(36); 

  for (var k in _ana.baseData) {
    if (_ana.baseData[k] !== undefined && _ana.baseData[k] !== "") {
      tmpParam.push(k + "=" + encodeURIComponent(_ana.baseData[k]));
    }
  }

  ajax({
    url: config.REQUEST_URL + "/_a.gif?" + tmpParam.join("&")
  })
  
}

// 基础数据s
_ana.getBaseData = function() {
  var d = _ana.baseData;

  // 获取设备信息
  let deviceInfo = [];
  try {
    const res = wx.getSystemInfoSync();
    deviceInfo[0] = res.screenWidth; // 屏幕宽度
    deviceInfo[1] = res.screenHeight; // 屏幕高度
  } catch (e) {

  }

  // 获取页面路由
  let router = _ana.fn.getRouter(); 
  let page_route = getCurrentPages()
  let current_options = page_route[page_route.length - 1].options //当前页面的参数
  console.log('current_options', current_options)
  let source = ''
  if (current_options && current_options.source){
    source = current_options.source
    wx.setStorageSync('SOURCE', current_options.source)
  }
  d.scn = deviceInfo.join('*'); //分辨率
  d.hrf = router.current || ''; //当前URL
  d.rfr = router.prev || ''; //referrer
  d.cid = wx.getStorageSync('MLL_CID') || ''; //设备id
  d.sessid = wx.getStorageSync('MA_si') || ''; //会话id
  d.is_experience = ''; //是否是体验馆帐号
  d.user_id = wx.getStorageSync('user_id') || ''; //用户帐号ID
  d.type = 'wx_miniprogram_mall';//来源站点
  d.src_t = ''; //站外来源时间
  d.site_f = router.current || ''; //站内来源
  d.frm = source; //外部小程序来源
  return d;
}

// 重写push方法
_ana.push = function() {
  var arg = arguments[0];
  if (!arg || arg.length < 1) {
    return;
  }

  Array.prototype.push.apply(_ana, arg);
  _ana.execute.apply(_ana, arg);
}

// 执行追踪
_ana.execute = function () {
  var arg = arguments;
  if (!arg || arg.length < 1) {
    return;
  }
  var fnName = arg[0];
  if (_ana.fn[fnName] && typeof _ana.fn[fnName] == 'function') {
    Array.prototype.shift.apply(arg);
    _ana.fn[fnName].apply(_ana.fn, arg);
  }
};

for (var k = 0; k < _ana.length; k++) {
  if ((_ana[k] && Object.prototype.toString.apply(_ana[k]) == '[object Array]')) {
    _ana.execute.apply(_ana, _ana[k] || []);
  }
}
module.exports = _ana;





