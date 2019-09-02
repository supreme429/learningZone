/**
 * @ utils/config.js
 * @ 配置文件
*/

const env = 'pro';
const config = {
  'dev': {
    baseUrl: 'http://test.meilele.com'
  },

  'test': {
    baseUrl: 'http://test.meilele.com'
  },

  'pro': {
    baseUrl: 'https://www.meilele.com'
  }
};

export default config[env];