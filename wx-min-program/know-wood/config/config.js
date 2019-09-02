const env = 'pro';
const config = {
  appName: '阅木',
  mllPublicImgUrl: "https://image.meilele.com/",
  env: {
    // 生产环境
    pro: {
      baseUrl: 'https://www.mll3321.com/',
      proxy: 'wx-proxy-web',
    },
    // 测试环境
    test: {
      baseUrl: 'https://mllmtest.com/',
      proxy: 'wx',
    },
    // 开发环境
    dev: {
      baseUrl: 'https://mllo2o.com/',
      proxy: 'wx-proxy-web',
    }
  },

  proName: 'ymmina/mina',

  miniWhiteList: {
    mllShop: '', // 美乐乐商城小程序
  },
  minEnvVersion: {
    pro: 'release',
    test: 'trial',
    dev: 'trial',
  }
}

module.exports = {
  config: config,
  env: config.env[env],
  appNum: config.appNum,
  appName: config.appName,
  mllPublicImgUrl: config.mllPublicImgUrl,
  miniWhiteList: config.miniWhiteList,
  minEnvVersion: config.minEnvVersion[env],
}