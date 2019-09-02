const env = 'pro';
const config = {
  appId: "wx895133510e9aa6e1",
  appNum: 10005,
  appName: '搭配梦想的家',
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
  
  proName: 'dhmina/mina',
  tel: '400-009-8666',

  miniWhiteList: {
    mllShop: 'wx5580510591bb14f4', // 美乐乐商城小程序
  },
  minEnvVersion: {
    pro: 'release',
    test: 'trial',
    dev: 'trial',
  },
  miniSource: 'dhmina',
}

module.exports = {
  config: config,
  env: config.env[env],
  appId: config.appId,
  appNum: config.appNum,
  appName: config.appName,
  mllPublicImgUrl: config.mllPublicImgUrl,
  miniWhiteList: config.miniWhiteList,
  minEnvVersion: config.minEnvVersion[env],
  miniSource: config.miniSource,
}