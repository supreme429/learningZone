// pages/index.js
const app = getApp();
const $ = global;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // navigator点击后保持hover状态时间
    hoverStayTime: app.globalData.hoverStayTime, 
    // 楼层排序数组
    floorSort: [], 
    // 各楼层数据对象，key、value形式
    floorData: {} ,
    types:{
      value:0,
      status:''
    }
  },

  onLoad: function() {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.showLoading({
      title: '数据加载中...',
    })
    let that = this
    //判断是否登录
    app.checkUserInfoAuthorize(function(status){
      if (status){
        that.setData({
          types: {
            value: 0,
            status: 1
          }
        })
      }
    })
    // 获取首页所有数据
    $.ajax({
      url: `${app.globalData.domain}/index/index/all/`,
      dataType: 'json',
      success: (result) => { 
        setTimeout(function(){
          wx.hideLoading()
        },1000)
        var data = result.data;

        if (result.statusCode == 200) {
          if (data.code == 200) {
            var indexData = data.data;
            
            // 循环所有数据，加工swiper部份数据
            for (let value of indexData) {
              // 加工渲染swiper的数据
              if (['tx', 'kt', 'ws', 'xys', 'cf', 'jjjs'].indexOf(value.floor) > -1) {
                // 设置swiper第一屏的图片显示标记为true，实现懒加载
                value.list[0].show = true;

                // 设置tab，如果本来就有，不设置
                if (!value.tab) {
                  value.tab = new Array(value.list.length).fill(null);
                }
              }

              // 设置每个swiper楼层数据对应的模版
              switch (value.floor) {
                case 'jxfg': 
                  value.templateId = 'style';
                  break;
                case 'tx':
                  value.templateId = 'suit';
                  break;
                case 'kt':
                case 'ws':
                case 'xys':
                case 'cf':
                case 'jjjs':
                  value.templateId = 'area';
                  break;
                default:
                  value.templateId = '';
              }

              // 设置楼层排序
              this.data.floorSort.push({
                floor: value.floor,
                templateId: value.templateId
                });
              // 设置各楼层数据
              this.data.floorData[value.floor] = value;
            }

            this.setData({
              floorSort: this.data.floorSort,
              floorData: this.data.floorData
            }, () => {
              for (let value of indexData) {
                if (['tx', 'kt', 'ws', 'xys', 'cf', 'jjjs'].indexOf(value.floor) > -1) {
                  // 设置第一屏高度
                  this.setFloorData(0, value.floor);
                }
              }
            });
          }
        } else {
          // 接口出错提示 TODO
        }
      },
      fail: () => {
        setTimeout(function () {
          wx.hideLoading()
        }, 1000)
      }
    });
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * swiper切换
   */
  swiperChange: function(event) {
    const index = event.detail.current; //滑动的index
    const floor = event.currentTarget.dataset.floor; // 楼层名称

    this.setFloorData(index, floor);
  },
  /**
   * 套系tab点击切换
   */
  suitTabTap: function(event) {
    const index = event.currentTarget.dataset.index;

    this.setFloorData(index, 'tx');
  },
  /**
   *  设置各swiper楼层数据数据
   *  @param {number} index 第几页数据
   *  @param {string} floor 楼层代码
   * */
  setFloorData: function(index = 0, floor = 'tx') {
    let that = this
    // 设置tab选中
    for (let i of this.data.floorData[floor].tab.keys()) {
      // 如果当前tab没有数据，填充一个空，前面没有直接fill，是因为fill填充对象指向同一个地址
      if (!this.data.floorData[floor].tab[i]) {
        this.data.floorData[floor].tab[i] = {};
      }

      if (i === index) {
        this.data.floorData[floor].tab[i].active = true;
      } else {
        this.data.floorData[floor].tab[i].active = false;
      }
    }

    // 懒加载图片
    this.data.floorData[floor].list[index].show = true; 

    this.setData({
      ['floorData.' + floor + '.tab']: this.data.floorData[floor].tab,
      ['floorData.' + floor + '.swiperCurrent']: index,
      ['floorData.' + floor + '.list']: this.data.floorData[floor].list,
      ['floorData.' + floor + '.name']: floor // 楼层名称
    }, () => {
      setTimeout(function(){
        // 获得当前区域swiper dom
        const query = wx.createSelectorQuery();
        query.selectAll('.floor-content.' + floor).boundingClientRect();

        // 设置当前区域swiperHeight值
        query.exec(res => {
          console.log('高度检测:', res[0][index])
          that.setData({
            ['floorData.' + floor + '.swiperHeight']: res[0][index] ? res[0][index].height : 0
          });
        });
      },4000)
      
    });

  },

  onShow: function() {
    let that = this
    //判断是否登录
    app.checkUserInfoAuthorize(function (status) {
      if (status) {
        that.setData({
          types: {
            value: 0,
            status: 1
          }
        })
      }
    })
    // 调用跟踪代码
    $.track.push(['trackView']);
  },
  onShareAppMessage: function (res) {
    return {
      title: '装修买家具 就上美乐乐',
      path: '/pages/index/index',
      success: function (res) {
        console.log(res)
        // 转发成功
      }
    }
  }
})