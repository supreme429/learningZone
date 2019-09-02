// pages/login/loginMobile.js
const $ = global;
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // navigator点击后保持hover状态时间
    hoverStayTime: app.globalData.hoverStayTime, 
    getCaptchaDisabled: false,
    getCaptchaText: '获取验证码',
    phoneNumber:'',
    imgurl:'',
    imgCodeStatus:false,
    imgCode:''
  },
  formSubmit:function(e){//提交,登录
    console.log('提交',e)
    var imgCodeStatus = this.data.imgCodeStatus
    if (!e.detail.value.phonenumber){
      wx.showToast({
        'title': '请输入手机号',
        'icon': 'none'
      })
      return
    }
    if (!e.detail.value.verifycode) {
      wx.showToast({
        'title': '请输入短信验证码',
        'icon': 'none'
      })
      return
    }
    if (imgCodeStatus && !e.detail.value.imgcode) {
      wx.showToast({
        'title': '请输入校验码',
        'icon': 'none'
      })
      return
    }
    let params = {
      'type': 4,
      'mobile': e.detail.value.phonenumber,
      'mobileCaptcha': e.detail.value.verifycode,
      'captchaType': 'sendPwd'
    }
    $.util.userLogin(params,2)
  },
  getPhone:function(e){//输入的手机号
    this.setData({
      phoneNumber: e.detail.value
    })
  },
  getImgCode:function(e){//输入的校验码
    this.setData({
      imgCode: e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 调用跟踪代码
    $.track.push(['trackView']);
    console.log(app.globalData.userInfoStatus)
  },
  
  refreshCode: function () {//刷新二维码
    this.setData({
      imgurl: $.util.getImgVerifyCode()
    })
  },
  getLoginCode:function(params,callback){//获取登录验证码
    let that = this;
    return new Promise((resolve)=>{
      $.ajax({
        url: app.globalData.Login_url + 'dubbo_api/user/password/miniAppPwd',
        data: params,
        success: function (res) {
          let datas = res.data
          console.log('验证码', datas)
          if (datas.error == 2) {
            that.setData({
              'imgCodeStatus': true,
              'imgurl': $.util.getImgVerifyCode()
            })
          }else if(datas.error == 3){
            that.setData({
              imgCode:''
            })
            that.refreshCode()
          }
          if (datas.error != 0){
            wx.showToast({
              'title': datas.msg,
              'icon': 'none'
            })
          }
          resolve(datas)
        }
      })
    })
    
  },
  /**
   * 点击获取手机验证码
   */
  getMsgCaptcha: function() {
    let that = this
    if (that.data.getCaptchaDisabled) {
      return;
    }
    let reg = /^[1][3,4,5,7,8,9][0-9]{9}$/; 
    let phoneNumber = this.data.phoneNumber;
    let imgCode = this.data.imgCode
    let imgCodeStatus = this.data.imgCodeStatus;
    let params = {}
    if (!reg.test(phoneNumber)){
      wx.showToast({
        'title': '请输入正确手机号',
        'icon':'none'
      })
      return
    }
    if (imgCodeStatus){
      if (!imgCode){
        wx.showToast({
          'title': '请输入校验码',
          'icon': 'none'
        })
        return
      }
      params = {
        captcha: imgCode,
        mobile: phoneNumber,
        crmSendType: 76,
        crmSendFrom: 7
      }
    }else{
      params = {
        mobile: phoneNumber,
        crmSendType: 76,
        crmSendFrom: 7
      }
    }
    that.getLoginCode(params).then(data=>{
      console.log(data)
      if (data.error !=0){
        return
      }
      var time = 120,
        timer = null;

      that.setData({
        getCaptchaDisabled: true,
        getCaptchaText: `${time}s后重发`
      });

      timer = setInterval(() => {
        time--;

        if (time === 0) {
          clearInterval(timer);
          that.setData({
            getCaptchaDisabled: false,
            getCaptchaText: '获取验证码'
          });
        } else {
          that.setData({
            getCaptchaText: `${time}s后重发`
          });
        }

      }, 1000);
    })
  }
})