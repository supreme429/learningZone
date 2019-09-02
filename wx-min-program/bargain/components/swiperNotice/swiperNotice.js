// components/swiperNotice/swiperNotice.js
const quick = require('../../utils/quick.js');
const util = require('../../utils/util.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goodsSn: String,
    autoplay: {
      type: Boolean,
      value: true,
    },
    vertical: {
      type: Boolean,
      value: true,
    },
    interval: {
      type: Number,
      value: 3000,
    },
    circular: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    noticeList: []
  },

  attached() {
    this.getBargainBroadCast();
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getBargainBroadCast() {
      if(!this.data.goodsSn) {
        setTimeout(() => {
          this.getBargainBroadCast();
        }, 100)
        return;
      };
      
      quick.requestGet({ url: 'bargainBroadCast'}, {
        goodsSn: this.data.goodsSn
      }).then(res => {
        let { code, data } = res.data;
        data = util.handleDataByArray(data, { price: 'price' });
        this.handleTime(data);
        if(code === 0) {
          this.setData({
            noticeList: data || []
          })
        }
      })
    },

    handleTime(data) {
      if(Array.isArray(data)) {
        data.forEach((item, index) => {
          data[index].time = item.time < 60 ? `${item.time}分钟` : `${Math.floor(item.time / 60)}小时`;
        })
      }
    },

    touchEvent() {
      return false;
    }
  }
})
