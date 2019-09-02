const env = 'dev';
const config = {
  appNum: 10006,
  appName: '销售助手',
  mllPublicImgUrl: "https://image.meilele.com/",
  env: {
    // 生产环境
    pro: {
      baseUrl: 'https://www.mll3321.com/',
      crm: 'https://crm.meilele.com',
      pc: 'https://www.meilele.com',
      proxy: 'wx-proxy-web',
    },
    // 测试环境
    test: {
      baseUrl: 'https://mllmtest.com/',
      crm: 'http://crmtest.meilele.com',
      pc: 'https://test.meilele.com',
      proxy: 'wx-proxy-web',
    },
    // 开发环境
    dev: {
      baseUrl: 'http://mllo2o.com/',
      crm: 'http://crmtest.meilele.com',
      pc: 'http://test.meilele.com',
      proxy: 'wx-proxy-web',
    }
  },

  proName: 'shmina/mina',
}

module.exports = {
  config: config,
  env: config.env[env],
  appNum: config.appNum,
  appName: config.appName,
  mllPublicImgUrl: config.mllPublicImgUrl
}