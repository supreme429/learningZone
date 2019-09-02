// miniprogram/pages/game/game.js
const app = getApp();
const util = require('../../utils/util.js');
const quick = require('../../utils/quick.js');
const business = require('../../utils/business.js');
const { router } = require('../../utils/router.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    resCache: {}, // 物品缓存
    styleCache: {}, // 风格缓存
    canvasId: 'game-ctx',
    GCHeight: '100%',
    bgWidth: 0,
    bgHeight: 0,
    // canvasData: [
    //   { url: 'http://7xotwj.com1.z0.glb.clouddn.com/8bd2f473-d79d-4550-92f4-73d79d1550cf.png?imageMogr2/crop/!408x405a0a0', x: 50, y: 50, w: 100, h: 100, z: 3 },
    // ],

    ratio: 1, // 屏比，屏宽除以图宽
    roomUuid: '',
    roomName: '',
    resUuid: '',
    roomList: [], // 空间列表
    roomResList: [], // 空间物品列表
    roomResStyleList: [], // 空间物品样式列表
    roomBgUrl: '', // 空间背景图链接【选择空间时赋值】
    locations: [], // 空间物品定位【选择空间后获取空间物品时赋值】

    isShowModalRoomsList: false, // 是否展示空间列表

    timer: {
      changeRoomRes: null,
      changeRoomStyle: null,
    },

    getUserLayoutUrl: 'getDefaultLayout',
    
    swiperCurrent: 0,
    swiperCurrentByResUuid: {},
    roomResCurrent: 0,

    roomResScrollLeft: 0,
    roomResItemWidth: 0,
    styleScrollLeft: 0,
    roomStyleItemWidth: 0,

    preViewImgs: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.roomUuid) {
      this.data.roomUuid = options.roomUuid;
      this.data.getUserLayoutUrl = 'getUserLayout';
    }
    // this.getSwiperCurrentByResUuid(); 【弃用】
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    util.getSystemInfoAsync().then(res => {
      util.getDomInfoById('#footer').then(domRes => {
        this.setData({
          GCHeight: `${res.windowHeight - domRes.height}px`
        })
      })
      // 
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 首次进来时清除所有当前缓存
    if (app.globalData.isClearRoomUuidStorage) {
      this.clearLocalStorage();
      app.globalData.isClearRoomUuidStorage = false;
    }
    this.init();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    business.addShare(app.globalData.openId)
    return business.setMinaShareConfig(app)
  },

  init() {
    if(!app.globalData.openId) {
      setTimeout(() =>  {
        this.init();
      }, 50)
      return;
    }

    this.getRoomList();
  },

  // 获取空间列表
  getRoomList() {
    return quick.requestGet({ url: 'getRoomList'}).then(res => {
      let { code, data } = res.data;
      if (code === 0 && data && data.length > 0) {
        const roomUuid = this.data.roomUuid || data[0].roomUuid;
        
        this.countRatio(data[0].roomBgPicUrl).then(() => {
          this.getRoomResList(roomUuid, data[0].roomName);
          this.data.roomBgUrl = data.filter(arr => {
            return arr.roomUuid == roomUuid;
          })[0]['roomBgPicUrl'];
          this.setData({
            roomList: data,
          }, () => {
            this.getUserLayout(roomUuid);
          })
        });
      }
    })
  },
  // 获取空间物品列表
  getRoomResList(roomUuid, roomName) {
    if (this.data.resCache[roomUuid]) {
      const obj = {
        resUuid: this.data.resCache[roomUuid][0].resUuid,
        roomUuid,
        roomName,
        roomResList: this.data.resCache[roomUuid]
      }
      if (!this.getLocalStorage(roomUuid)) {
        obj.locations = this.convertField(this.data.resCache[roomUuid])
      }
      this.setData(obj)
      this.getResStyleList(obj.roomUuid, obj.resUuid);
      return;
    }
    
    quick.requestGet({ url: 'getRoomResList' }, { roomUuid })
      .then(res => {
        let { code, data } = res.data;
        if (code === 0 && data && data.length > 0) {
          let obj = {
            resUuid: data[0].resUuid,
            roomUuid,
            roomName,
            roomResList: data,
          };
          if (!this.getLocalStorage(roomUuid)) {
            obj.locations = this.convertField(data)
          }
          this.data.resCache[roomUuid] = data;
          this.setData(obj);
          this.getResStyleList(obj.roomUuid, obj.resUuid);
        }
      })
  },
  // 获取空间物品样式列表
  getResStyleList(roomUuid, resUuid) {
    if(!roomUuid && !resUuid) return;
    if(this.data.styleCache[resUuid]) {
      this.setData({
        resUuid,
        roomResStyleList: this.data.styleCache[resUuid],
        swiperCurrent: this.data.swiperCurrentByResUuid[resUuid] || 0,
      }, () => {
        this.preViewStyleImg();
      })
      return;
    }
    quick.requestGet({ url: 'getResStyleList' }, { roomUuid, resUuid })
      .then(res => {
        let { code, data } = res.data;
        if (code === 0 && data && data.length > 0) {
          this.data.styleCache[resUuid] = data;
          this.setData({
            resUuid,
            roomResStyleList: data,
            swiperCurrent: this.data.swiperCurrentByResUuid[resUuid] || 0,
          }, () => {
            this.preViewStyleImg();
          })
        }
      })
  },

  // 获取用户空间设计，有则布署
  getUserLayout(roomUuid) {
    if(this.getLocalStorage(roomUuid)) {
      const data = this.getLocalStorage(roomUuid);
      this.setData({
        roomBgUrl: this.data.roomBgUrl,
        locations: data.locations,
      }, () => {
        this.getClassRoomResItemWidth()
      })
      
      return;
    }
    quick.requestGet({ url: this.data.getUserLayoutUrl}, {
      openId: app.globalData.openId,
      roomUuid,
    }).then(res => {
      const { code, data } = res.data;
      const setData = {};
      if (code === 0 && data.userLayoutDetailsVoList) {
        // 布署空间
        this.data.locations = this.convertField(data.userLayoutDetailsVoList);
        data.userLayoutDetailsVoList && data.userLayoutDetailsVoList.forEach(item => {
          this.replaceImg(item.resUuid, item);
        })
        setData.locations = this.data.locations;
      } 
      setData.roomBgUrl = this.data.roomBgUrl;
      this.setData(setData, () => {
        this.getClassRoomResItemWidth()
      })
    })
  },

  // 改变空间
  changeRoom(e) {
    const { item } = e.currentTarget.dataset;
    this.countRatio(item.roomBgPicUrl).then(() => {
      // 重绘物品位置队列
      this.setData({
        locations: [],
        roomBgUrl: item.roomBgPicUrl,
      })
      this.getRoomResList(item.roomUuid, item.roomName);
      this.getUserLayout(item.roomUuid);
      this.hideModalRoomsList();
    });
  },

  // 改变空间物品
  changeRoomRes(e) {
    clearTimeout(this.data.timer.changeRoomRes);
    this.data.timer.changeRoomRes = setTimeout(() => {
      // console.log('changeRoomRes')
      const { resuuid, index } = e.currentTarget.dataset;
      this.setData({ styleScrollLeft: 0 })
      this.getResStyleList(this.data.roomUuid, resuuid);
      this.hideModalRoomsList();
      this.setRoomResScrollLeft(index);
    }, 500)
  },

  /**
  changeRoomRes(e) {
    clearTimeout(this.data.timer.changeRoomRes);
    this.data.timer.changeRoomRes = setTimeout(() => {
      // console.log('changeRoomRes')
      const { resuuid, index } = e.currentTarget.dataset;
      // this.getResStyleList(this.data.roomUuid, resuuid);
      // this.hideModalRoomsList();
      this.setData({
        roomResCurrent: index
      })
    }, 500)
  },
  */
  changeRoomResBySwiper(e) {
    const { current } = e.detail;
    const resUuid = this.data.roomResList[current].resUuid;
    this.getResStyleList(this.data.roomUuid, resUuid);
    this.hideModalRoomsList();
    
  },

  // 改变物品样式，重绘图片
  changeStyle(e) {
    clearTimeout(this.data.timer.changeStyle);
    this.data.timer.changeStyle = setTimeout(() => {
      const { item, index } = e.currentTarget.dataset;
      this.addLocation(item.resUuid);
      this.replaceImg(item.resUuid, item);
      this.saveLocalStorage(this.data.roomUuid, this.data.locations);
      this.setData({
        locations: this.data.locations,
      }, () => {
        this.setRoomStyleScrollLeft(index);
      })
      this.hideModalRoomsList();
    }, 500)
  },
  /*
  changeStyle(e) {
    clearTimeout(this.data.timer.changeStyle);
    this.data.timer.changeStyle = setTimeout(() => {
      const { item, index } = e.currentTarget.dataset;
      // this.addLocation(item.resUuid);
      // this.replaceImg(item.resUuid, item);
      // this.saveLocalStorage(this.data.roomUuid, this.data.locations);
      // this.setData({
      //   locations: this.data.locations,
      //   swiperCurrent: index
      // })
      // this.hideModalRoomsList();
      this.setData({
        swiperCurrent: index
      })
    }, 500)
  },
  changeStyleBySwiper(event) {
    const { current } = event.detail;
    const item = this.data.roomResStyleList[current];
    this.data.swiperCurrentByResUuid[this.data.resUuid] = current;
    this.addLocation(item.resUuid);
    this.replaceImg(item.resUuid, item);
    this.saveLocalStorage(this.data.roomUuid, this.data.locations);
    this.setData({
      locations: this.data.locations,
      // swiperCurrent: current
    })
    this.hideModalRoomsList();
  },
  */

  // 计算背景图缩放比
  countRatio(roomBgUrl) {
    // if (!roomBgUrl) return;
    return new Promise((resolve, reject) => {
      const fn = (res) => {
        util.getSystemInfoAsync().then(sysRes => {
          this.data.ratio = sysRes.windowWidth / res.width;
          this.data.bgWidth = res.width;
          this.data.bgHeight = res.height;
          resolve()
        })
      }
      
      if (/\?w=(\d+)/.test(roomBgUrl)) {
        const matchs = roomBgUrl.match(/\?w=(\d+)&h=(\d+)/);
        const width = matchs[1];
        const height = matchs[2];
        fn({ width, height });
      } else {
        wx.getImageInfo({
          src: roomBgUrl,
          success: res => {
            fn(res);
          }
        })
      }
    })
  },

  // 转换数据字段
  convertField(data) {
    if(!Array.isArray(data)) return;
    const convert = {
      xaxisCoordinates: 'left',
      yaxisCoordinates: 'top',
      picHeight: 'height',
      picWidth: 'width',
      showLevel: 'z-index',
    },
    locations = [];

    data.forEach(item => {
      let o = {},
          styles = [];
      for(let k in convert) {
        const val = k != 'showLevel' ? (item[k] * this.data.ratio) + 'px' : item[k] || 0;
        o[convert[k]] = val;
        styles.push(`${convert[k]}:${val}`);
      }
      o.resUuid = item.resUuid;
      o.goodsName = '';
      o.styleUuid = '';
      o.styleStr = styles.join(';');
      o.imgUrl = '';
      locations.push(o);
    })
    return locations;
  },

  // 添加未有的位置
  addLocation(resUuid) {
    let isExist = false;
    this.data.locations.forEach(item => {
      if (item.resUuid === resUuid) {
        isExist = true;
      }
    })
    if(!isExist) {
      this.data.roomResList.forEach(item => {
        if(item.resUuid === resUuid) {
          this.data.locations.push(this.convertField([item])[0]);
        }
      })
    }
  },
  
  // 替换样式图片
  replaceImg(resUuid, data) {
    this.data.locations.forEach(item => {
      if (item.resUuid === resUuid) {
        const cartoonBigPicUrl = this.handleImgAddImageslim(data.cartoonBigPicUrl);
        const imgUrl = this.handleImgAddImageslim(item.imgUrl)
        // item.imgUrl = item.imgUrl != '' && imgUrl == cartoonBigPicUrl ? '' : cartoonBigPicUrl;
        item.imgUrl = cartoonBigPicUrl;
        item.goodsName = data.goodsName;
        item.styleUuid = data.styleUuid;
        return;
      }
    })
    return this.data.locations;
  },

  // 添加七牛云图片瘦身传参
  handleImgAddImageslim(imgUrl) {
    if (imgUrl.indexOf('?') > -1) {
      return /imageslim/.test(imgUrl) ? imgUrl : imgUrl + '&imageslim'
    } else {
      return imgUrl + '?imageslim'
    }
  },

  toggleModalRoomsList() {
    this.setData({
      isShowModalRoomsList: !this.data.isShowModalRoomsList
    })
  },

  hideModalRoomsList() {
    if (!this.data.isShowModalRoomsList) return;
    this.setData({
      isShowModalRoomsList: false
    })
  },

  /** draw start */
  // 绘制图形
  draw(bgUrl, arr, callback) {
    const ctx = wx.createCanvasContext(this.data.canvasId);
    
    util.getDomInfoById('#' + this.data.canvasId).then(res => { 
      this.loadImg({ imgUrl: bgUrl }).then(bgRes => {
        wx.getImageInfo({
          src: bgRes.tempFilePath,
          success: size => {
            ctx.drawImage(bgRes.tempFilePath, 0, 0, res.width, res.width * size.height / size.width);
          }
        })

        let _arr = [];
        for (let i = 0, len = arr.length; i < len; i++) {
          if (!arr[i].imgUrl) continue;
          _arr.push(this.loadImg(arr[i]));
        }
        Promise.all(_arr)
          .then((res) => {
            arr = this.sortArr(arr);
            console.log(arr)
            for (let i = 0, len = arr.length; i < len; i++) {
              if (!arr[i].imgUrl) continue;
              ctx.drawImage(arr[i].imgUrl, parseFloat(arr[i].left), parseFloat(arr[i].top), parseFloat(arr[i].width), parseFloat(arr[i].height));
            }

            ctx.draw();
            setTimeout(() => {
              callback();
            }, 0)
          });
      })
    })
  },



  // 加载图片
  loadImg(obj) {
    
    return new Promise((resolve, reject) => {
      wx.downloadFile({
        url: obj.imgUrl,
        success (res) {
          if (res.statusCode === 200) {
            obj.imgUrl = res.tempFilePath;
            resolve(res);
          }
        }
      })
    });
  },
  
  // 根据z-index排序显示顺序
  sortArr(arr) {
    console.log(arr)
    for (var i = 0, len = arr.length; i < len; i++) {
      for (var j = i + 1, jLen = arr.length; j < jLen; j++) {
        if (arr[i]['z-index'] > arr[j]['z-index']) {
          var temp = arr[i];
          arr[i] = arr[j];
          arr[j] = temp;
        }
      }
    }
    return arr;
  },

  // 保存canvas为图片
  saveCanvas() {
    // loading
    wx.showLoading({
      title: '疯狂改卷,请稍等',
    });
    // this.saveSwiperCurrentByResUuid();
    this.draw(this.data.roomBgUrl, this.data.locations, this.saveImg);
  },

  saveImg() {
    // 保存为图片
    const { bgHeight, bgWidth } = this.data;
    util.getDomInfoById('#' + this.data.canvasId).then(res => {
      const width = res.width;
      const height = res.width / (bgWidth / bgHeight);
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: width,
        height: height,
        destWidth: width * 2,
        destHeight: height * 2,
        canvasId: this.data.canvasId,
        success: res => {
          console.log(res.tempFilePath)
          // 保存到本地并上传到服务器
          business.uploadFile(res.tempFilePath).then(res => {
            const { status, url } = JSON.parse(res.data);
            if (status != 'success') {
              quick.showToastNone('图片保存失败，请重试！');
              return;
            }
            // 上传成功获取图片链接
            quick.requestPost({ url: 'saveLayout' }, {
              layoutPicUrl: url,
              openId: app.globalData.openId,
              roomName: this.data.roomName,
              roomUuid: this.data.roomUuid,
              userLayoutDetailsVoList: this.data.locations.filter(item => {
                return item.imgUrl && item.imgUrl.length > 0;
              }),
            }).then(sRes => {
              const { code, data } = sRes.data;
              if (code === 0) {
                // 跳转到结果页面
                wx.redirectTo({
                  url: router('result', [`layoutUuid=${data.layoutUuid}`]),
                })
              }
              wx.hideLoading();
            })
          });
        }
      })
    })
  },

  setBgWH(res) {
    this.data.bgWidth = res.detail.width;
    this.data.bgHeight = res.detail.height;
  },
  /** draw end */
  /** 本地存储 start */
  getLocalKey(roomUuid) {
    return 'roomUuid_' + roomUuid;
  },
  saveLocalStorage(roomUuid, locations) {
    wx.setStorage({
      key: this.getLocalKey(roomUuid),
      data: {
        roomBgUrl: this.data.layoutPicUrl,
        locations,
      }
    })
  },
  getLocalStorage(roomUuid) {
    return wx.getStorageSync(this.getLocalKey(roomUuid));
  },

  clearLocalStorage() {
    wx.getStorageInfo({
      success(res) {
        res.keys.filter(key => {
          return /^roomUuid\_[0-9a-zA-Z].+/.test(key)
        }).forEach(item => {
          wx.removeStorageSync(item)
        })
      }
    })
    wx.removeStorageSync('swiperCurrentByResUuid')
  },
  
  // 保存已选的位置，避免修改时改变物品自动发生样式变化
  /*
  saveSwiperCurrentByResUuid() {
    wx.setStorage({
      key: 'swiperCurrentByResUuid',
      data: this.data.swiperCurrentByResUuid,
    })
  },

  getSwiperCurrentByResUuid() {
    wx.getStorage({
      key: 'swiperCurrentByResUuid',
      success: res => {
        this.setData({
          swiperCurrentByResUuid: res.data
        })
      }
    })
  },
  */
  /** 本地存储 end */
  getClassRoomResItemWidth() {
    let i = 0;
    setTimeout(() => {
      if (i < 10 && !this.data.roomResItemWidth) {
        this.getClassRoomResItemWidthFn();
        i++;
      }
    }, 100)
  },

  getClassRoomResItemWidthFn() {
    const query = wx.createSelectorQuery()
    query.select('.room-res-item').fields({
      context: true,
      size: true,
    }, res => {
      if(!res) return;
      console.log('getClassRoomResItemWidth');
      this.data.roomResItemWidth = res.width;
    }).exec()
  },

  setRoomResScrollLeft(index) {
    this.setData({
      roomResScrollLeft: this.data.roomResItemWidth * index
    })
  },

  setRoomStyleScrollLeft(index) {
    const query = wx.createSelectorQuery()
    query.select('.room-style-item').fields({
      context: true,
      size: true,
    }, res => {
      console.log('setRoomStyleScrollLeft')
      if (!res) return;
      this.setData({
        styleScrollLeft: res.width * index
      })
    }).exec()
  },

  // 预加载当前栏目的图片
  preViewStyleImg() {
    const imgs = [];
    let i = 0;
    this.data.roomResStyleList.forEach(item => {
      const img = this.handleImgAddImageslim(item.cartoonBigPicUrl);
      if (this.data.preViewImgs.indexOf(img) === -1) {
        this.data.preViewImgs.push(img);
        i++;
      }
    })
    if( i > 0 ) {
      this.setData({
        preViewImgs: this.data.preViewImgs
      })
    }
  },
})