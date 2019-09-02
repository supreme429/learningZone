// components/helpBargainText/helpBargainText.js
const util = require('../../utils/util.js');
// goodsStatus: 商品状态 0: 已结束，1: 未结束
// bargainStatus: 砍价状态 1: 砍价中，2: 砍价失败，3: 砍价成功，4: 砍价取消
// helpStatus: 帮砍状态 0: 帮砍失败，1: 帮砍成功，2: 无人帮砍
// cutAmount: 好友帮砍金额
// helpBrUuid: 帮砍好友砍价记录brUuid
// helpPeopleNum: 帮砍人数（不包含发起人）
// helpBargainAmount: 累计帮砍金额
// currentPrice: 购买价
// isHelp: 是否已帮砍 0: 第一次帮砍，1: 已帮砍

Component({
  /**
   * 组件的属性列表
   */

  properties: {
    role: {
      type: String,
      value: 'friend'
    }, // friend：朋友， own：自己
    helpRes: Object,
  },

  /**
   * 组件的初始数据
   */
  data: {
    copyWrite: "", // 砍价文案
    btnText: "", // 按钮文案
    statusController: {
      // 【第一位】 goodsStatus: 商品状态 0: 已结束，1: 未结束
      // 【第二位】 bargainStatus: 砍价状态 1: 砍价中，2: 砍价失败【没砍到最低价】，3: 砍价成功，4: 砍价取消【超时】
      // 【第三位】 helpStatus: 帮砍状态 0: 帮砍失败，1: 帮砍成功，2: 无人帮砍
      /*  【1】0 开头为已过期的商品 */
      0: "<p class='helpBargainDetail'><span class='price'>该商品活动已结束了哦！</span></p>",

      /*  【1】1 开头为活动中的商品 */
        // 1砍价中 帮砍成功
      111:  {
              own: '',
              friend: "<p class='helpBargainDetail'>你已帮好友砍了<span class='price'>{{cutAmount}}</span>元，已经有{{helpPeopleNum}}个人帮他砍价了，目前已砍<span class='price'>{{helpBargainAmount}}</span>元，马上发起自己的砍价吧！</p>"
            },
      
      // 【2】2砍价失败 
      120: {
        own: "<p class='helpBargainDetail'><span class='price'>该砍价活动已结束，您可以再次发起砍价</span></p>",
        friend: "<p class='helpBargainDetail'>一共有{{helpPeopleNum}}个人帮他砍价了，累计砍掉了<span class='price'>{{helpBargainAmount}}</span>元，好友以<span class='price'>{{currentPrice}}</span>元价格成交，马上发起自己的砍价吧！</p>",
      },
      121: {
        own: "<p class='helpBargainDetail'><span class='price'>该砍价活动已结束，您可以再次发起砍价</span></p>",
        friend: "<p class='helpBargainDetail'>你已帮好友砍了<span class='price'>{{cutAmount}}</span>元，一共有{{helpPeopleNum}}个人帮他砍价了，累计砍掉了<span class='price'>{{helpBargainAmount}}</span>元，好友以<span class='price'>{{currentPrice}}</span>元价格成交，马上发起自己的砍价吧！</p>",
      },
      122: {
        own: "<p class='helpBargainDetail'><span class='price'>该砍价活动已结束，您可以再次发起砍价</span></p>",
        friend: "<p class='helpBargainDetail'>对方自砍1刀，砍掉了<span class='price'>{{helpBargainAmount}}</span>元，以<span class='price'>{{currentPrice}}</span>元购买了此商品！</p>",
      },

      // 【2】3砍价成功
      130: {
        own: "<p class='helpBargainDetail'><span class='price'>恭喜您，砍价成功！您可以再次发起砍价</span></p>",
        friend: "<p class='helpBargainDetail'>一共有{{helpPeopleNum}}个人帮他砍价了，累计砍掉了<span class='price'>{{helpBargainAmount}}</span>元，成功砍到了最低价<span class='price'>{{currentPrice}}</span>元，马上发起自己的砍价吧！</p>",
      },
      131: {
        own: "<p class='helpBargainDetail'><span class='price'>恭喜您，砍价成功！您可以再次发起砍价</span></p>",
        friend: "<p class='helpBargainDetail'>你已帮好友砍了<span class='price'>{{cutAmount}}</span>元，一共有{{helpPeopleNum}}个人帮他砍价了，累计砍掉了<span class='price'>{{helpBargainAmount}}</span>元，成功砍到了最低价<span class='price'>{{currentPrice}}</span>元，马上发起自己的砍价吧！</p>",
      },
      132: {
        own: "<p class='helpBargainDetail'><span class='price'>恭喜您，砍价成功！您可以再次发起砍价</span></p>",
        friend: "<p class='helpBargainDetail'>好友自砍1刀，成功砍到最低价<span class='price'>{{currentPrice}}</span>元！</p>",
      },
      // 【2】4砍价取消
      140: {
        own: "<p class='helpBargainDetail'><span class='price'><span class='price'>很遗憾没有砍到最低价，再接再厉</span></p>",
        friend: "<p class='helpBargainDetail'>一共有{{helpPeopleNum}}个人帮他砍价了，累计砍掉了<span class='price'>{{helpBargainAmount}}</span>元，好友差一点就砍价成功了，马上发起自己的砍价吧！</p>",
      },
      141: {
        own: "<p class='helpBargainDetail'><span class='price'><span class='price'>很遗憾没有砍到最低价，再接再厉</span></p>",
        friend: "<p class='helpBargainDetail'>你已帮好友砍了<span class='price'>{{cutAmount}}</span>元，一共有{{helpPeopleNum}}个人帮他砍价了，累计砍掉了<span class='price'>{{helpBargainAmount}}</span>元，好友差一点就砍价成功了，马上发起自己的砍价吧！</p>",
      },
      142: {
        own: "<p class='helpBargainDetail'><span class='price'>很遗憾没有砍到最低价，再接再厉</span></p>",
        friend: "<p class='helpBargainDetail'>好友1刀砍掉了<span class='price'>{{helpBargainAmount}}</span>元，差一点砍价成功</p>",
      },
    }
  },

  attached: function() {
    this.handleCopyWrite();
    this.handleBtnText();
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 处理砍价文案
    handleCopyWrite() {
      const helpRes = this.data.helpRes;
      const { goodsStatus, bargainStatus, helpStatus, cutAmount, helpBrUuid, helpPeopleNum, helpBargainAmount, currentPrice } = this.data.helpRes;
      
      let status = this.data.statusController;
      let copyWrite = goodsStatus == 0 ? status[0] : status[`${goodsStatus}${bargainStatus}${helpStatus || 0}`][this.data.role];
      if (copyWrite == undefined) return;

      for (let k in helpRes) {
        let reg = new RegExp('\{\{' + k + '\}\}', "g");
        copyWrite = copyWrite.replace(reg, helpRes[k]);
      }
      
      this.setData({
        copyWrite
      })
    },

    // 处理按钮文案
    handleBtnText() {
      const textByRole = {
        own: '再次发起砍价',
        friend: '我也发起砍价',
      }
      const { goodsStatus, bargainStatus, helpStatus } = this.data.helpRes;
      let btnText = goodsStatus == 0 ? '去首页看看其他商品' : textByRole[this.data.role];

      if (goodsStatus == 0) {
        this.btnEvent = () => {
          wx.redirectTo({
            url: '/pages/index/index',
          })
        }
      }

      this.setData({
        btnText: btnText
      })
    },

    // 按钮事件
    btnEvent() {
      this.triggerEvent('bargain')
    }
  }
})
