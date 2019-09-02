const env = 'dev';
const config = {
  appId: "wxd43dc6861890ab39",
  appNum: 10004,
  appName: '大砍家',
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
  
  proName: 'bargainmina/mina',
  servicePhone: '400-009-8666'  //客服电话
}

module.exports = {
  config: config,
  env: config.env[env],
  appId: config.appId,
  appNum: config.appNum,
  appName: config.appName,
  mllPublicImgUrl: config.mllPublicImgUrl
}