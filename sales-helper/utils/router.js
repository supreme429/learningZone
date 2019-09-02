/**
 * 重组页面路由
 * @param page 
 * @param options eg:['a=1','b=2']
 */
const router = (page, options = []) => {
  let url = `/pages/${page}/${page}${options.length > 0 ? '?' + options.join('&') : ''}`;
  return url;
}

module.exports = {
  router
}