const app = getApp()

const http = (url, data, header, method) => {
  return new Promise(function (resolve, reject) {
    wx.request({
      url: app.globalData.baseUrl + url,
      method: method,
      data: data,
      header: {
        'Authorization': wx.getStorageSync('token'),
        'content-type': 'application/json',
        'login-type': 'wx'
      },
      success: function (res) {
        if (res.statusCode == 200) {
          resolve(res.data);
        } else if (res.statusCode == 401) {
          // 清除登录相关内容
          try {
            wx.removeStorageSync('userInfo');
            wx.removeStorageSync('token');
          } catch (e) {
            // Do something when catch error
          }
          // 切换到登录页面
          wx.navigateTo({
            url: '/pages/login/login'
          });
        } else {
          reject({ error: '服务器忙，请稍后重试', code: 500 });
          return;
        }
      },
      fail: function (res) {
        // fail调用接口失败
        reject({ error: '网络错误', code: 0 });
      },
      complete: function (res) {
        // complete
      }
    })
  })
}

module.exports = http
