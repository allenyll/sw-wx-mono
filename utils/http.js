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
          //getToken(url, data, header, method, resolve);
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

function getToken(url, data, header, method, resolve) {
  wx.login({
    success: res => {
      if (res.code) {
        wx.request({
          url: app.globalData.authUrl+'/wx/auth/token',
          data: {
            code: res.code,
            mode: 'sweb_wx'
          },
          method: "POST",
          header: {
            'content-type': 'application/json',
            'login-type': 'wx'
          },
          success: function (res) {
            var token = res.data.data.accessToken;
            var openid = res.data.data.openid;
            app.globalData.openid = openid;
            app.globalData.token = token;
            wx.setStorageSync('openid', openid);
            wx.setStorageSync('token', token);
            http(url, data, header, method).then(res => resolve(res));
          }
        });
      }  
    }
  });
}

module.exports = http
