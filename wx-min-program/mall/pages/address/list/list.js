// pages/address/addressList.js
const $ = global;
const app = getApp();
const requestPrefix = app.globalData.domain;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // navigator点击后保持hover状态时间
    hoverStayTime: app.globalData.hoverStayTime, 
    // 屏幕宽度
    windowWidth: wx.getSystemInfoSync().windowWidth,
    // 地址操作区域宽度
    handleWidth: 494,
    // 是否是从确认订单页过来的
    isFromOrder: false,
    addressList: []
  },
  onLoad(options) {
    let isFromOrder = options.types && options.types == 'FromOrder';

    if (isFromOrder) {
      this.setData({
        isFromOrder: isFromOrder
      });
    }
  },
  // 页面重新载入时，重新拉数据
  onShow() {
    wx.showLoading({
      title: '数据加载中'
    });

    $.ajax({
      url: `${requestPrefix}/user/XcxUser/address_list/`,
      success: (result) => {
        setTimeout(function () {
          wx.hideLoading();
        }, 500);

        if (result.statusCode == 200) {
          if (result.data.code == 200) {
            let data = result.data.data;

            this.setData({
              addressList: data
            });
          }
        }
      },
      fail: () => {
        wx.hideLoading();
      }
    });

    // 调用跟踪代码
    $.track.push(['trackView']);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // wx.showLoading({
    //   title: '数据加载中'
    // });
    
    // $.ajax({
    //   url: `${requestPrefix}/user/XcxUser/address_list/`,
    //   success: (result) => {
    //     setTimeout(function () {
    //       wx.hideLoading();
    //     }, 500);

    //     if (result.statusCode == 200) {
    //       if (result.data.code == 200) {
    //         let data = result.data.data;

    //         this.setData({
    //           addressList: data
    //         });
    //       }
    //     }
    //   },
    //   fail: () => {
    //     wx.hideLoading();
    //   }
    // });
  },
  /**
   * 单条地址滑动开始
   */
  addressTouchStart(e) {
    // 记录开始滑动的时间和起点
    this.touchStartData = {
      changedTouches: e.changedTouches[0],
      timeStamp: e.timeStamp
    };
  },
  /**
   * 单条地址滑动结束
   */
  addressTouchEnd(e) {
    if (!this.touchStartData) {
      return;
    }

    let index = e.currentTarget.dataset.index,
      startX = this.touchStartData.changedTouches.clientX,
      startTime = this.touchStartData.timeStamp,
      endX = e.changedTouches[0].clientX,
      endTime = e.timeStamp;

    // 判断滑动方向，小于0向左，大于0向右
    if (endX - startX < 0) {
      if (this.data.addressList[index].left >= this.data.handleWidth) {
        return;
      } else {
        trigger.call(this, false);
      }
    } else if (endX - startX > 0) {
      if (this.data.addressList[index].left <= 0) {
        return;
      } else {
        trigger.call(this, true);
      }
    }

    /**
     * 滑动触发判断
     * param {boolean} true 向右，false 向左
     */
    function trigger(drt) {
      if ((endTime - startTime) < 300) {
        // 短时间触发
        if (Math.abs(endX - startX) > 30) {
          if (drt) {
            this.data.addressList[index].left = 0;
            // this.data.addressList[index].isRight = false;
          } else {
            this.data.addressList[index].left = this.data.handleWidth;
            // this.data.addressList[index].isRight = true;
          }
        } else {
          if (drt) {
            this.data.addressList[index].left = this.data.handleWidth;
          } else {
            this.data.addressList[index].left = 0;
          }
        }
      } else {
        // 长时间触发
        if (Math.abs(endX - startX) > (this.data.handleWidth * this.data.windowWidth / 750 / 2)) {
          if (drt) {
            this.data.addressList[index].left = 0;
            // this.data.addressList[index].isRight = false;
          } else {
            this.data.addressList[index].left = this.data.handleWidth;
            // this.data.addressList[index].isRight = true;
          }
        } else {
          if (drt) {
            this.data.addressList[index].left = this.data.handleWidth;
          } else {
            this.data.addressList[index].left = 0;
          }
        }
      }
    } 

    this.setData({
      addressList: this.data.addressList
    });
  },
  // 设置默认地址
  setDefault(e) {
    var addressId = e.currentTarget.dataset.addressId;
   
   $.ajax({
     url: `${app.globalData.Login_url}add_cart/?step=setDefaultConsignee`,
     data: {
       address_id: addressId
     },
     success: (result) => {
       if (result.statusCode == 200) {
         if (result.data.error == 0) {
           // 如果是确认订单页过来的
           if (this.data.isFromOrder) {
             // 获取当前栈数组
             let pageArr = getCurrentPages();
             // 循环页面栈，计算返回到订单结算页需要几步
             for (let i = 0, len = pageArr.length; i < len; i++) {
               if (pageArr[i].route == 'pages/confirm-order/confirm-order') {
                 wx.navigateBack({
                   delta: len - 1 - i
                 });

                 break;
               }
             }
           } else {
             wx.showToast({
               mask: true,
               duration: 1000,
               title: '设置成功！'
             });
           }

           // 更新视图
           for (let i = 0, len = this.data.addressList.length; i < len; i++) {
             if (this.data.addressList[i].address_id == addressId) {
               this.data.addressList[i].default = '1';
               this.data.addressList[i].left = 0;
              //  this.data.addressList[i].isRight = false;
             } else {
               this.data.addressList[i].default = '0';
             }
           }
           
           this.setData({
             addressList: this.data.addressList
           });
         } else {
           wx.showToast({
             mask: true,
             duration: 1000,
             title: '设置失败！'
           });
         }
       }
     }
   });
  },
  // 编辑地址
  editAddress(e) {
    var addressId = e.currentTarget.dataset.addressId;

    // 更新视图
    for (let i = 0, len = this.data.addressList.length; i < len; i++) {
      if (this.data.addressList[i].address_id == addressId) {
        this.data.addressList[i].left = 0;
      }
    }

    this.setData({
      addressList: this.data.addressList
    });

    wx.navigateTo({
      url: `/pages/address/addEdit/addEdit?addressId=${addressId}${this.data.isFromOrder ? "&types=FromOrder" : ""}`,
    });
  },
  // 删除地址
  deleteAddress(e) {
    wx.showModal({
      title: '',
      content: '是否确定删除地址？',
      cancelColor: '#da0000',
      confirmColor: '#da0000',
      success: (res) => {
        if (res.confirm) {
          var addressId = e.currentTarget.dataset.addressId;

          $.ajax({
            url: `${app.globalData.Login_url}add_cart/?step=dropConsignee`,
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
              address_id: addressId
            },
            success: (result) => {
              if (result.statusCode == 200) {
                if (result.data.error == 0) {
                  wx.showToast({
                    mask: true,
                    duration: 1000,
                    title: '删除成功！'
                  });

                  // 更新视图
                  for (let i = 0, len = this.data.addressList.length; i < len; i++) {
                    if (this.data.addressList[i].address_id == addressId) {
                      this.data.addressList.splice(i, 1);
                      break;
                    }
                  }

                  this.setData({
                    addressList: this.data.addressList
                  });
                } else {
                  wx.showToast({
                    mask: true,
                    duration: 1000,
                    title: '删除失败！'
                  });
                }
              }
            }
          });
        } else if (res.cancel) {
          
        }
      }
    });
  }
})