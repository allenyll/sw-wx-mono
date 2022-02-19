/**
 * 用户相关服务
 */
var app = getApp();

/**
 * Promise封装wx.login
 */
function login() {
  return new Promise(function(resolve, reject) {
    wx.login({
      success: function(res) {
        if (res.code) {
          resolve(res);
          
        } else {
          reject(res);
        }
      },
      fail: function(err) {
        reject(err);
      }
    });
  });
}

/**
 * 调用微信登录
 */
function loginByWeixin(baseUrl, userInfo) {
  return new Promise(function(resolve, reject) {
    return login().then((res) => {
      getToken(res, baseUrl, userInfo).then((res) => {
        if (res.data.success) {
          resolve(res);
        } else {
          reject(res.message);
        }
      });
    }).catch((err) => {
      reject(err);
    })
  });
}

function getToken(res, baseUrl, userInfo) {
  return new Promise(function(resolve, reject) {
    if (res.code) {
      wx.request({
        url: baseUrl+'/wx/auth/token',
        data: {
          code: res.code,
          mode: 'sweb_wx',
          customer: userInfo
        },
        method: "POST",
        header: {
          'content-type': 'application/json',
          'login-type': 'wx'
        },
        success: function (res) {
          var token = res.data.data.accessToken;
          var openid = res.data.data.openid;
          var customer = res.data.data.customer;
          wx.setStorageSync('openid', openid);
          wx.setStorageSync('token', token);
          wx.setStorageSync('userInfo', customer);
          resolve(res);
        }
      });
    } else {
      reject(false);
    }
  });  
}

/**
 * 判断用户是否登录
 */
function checkLogin() {
  return new Promise(function(resolve, reject) {
    if (wx.getStorageSync('userInfo') && wx.getStorageSync('token')) {
      checkSession().then(() => {
        resolve(true);
      }).catch(() => {
        reject(false);
      });
    } else {
      reject(false);
    }
  });
}

/**
 * Promise封装wx.checkSession
 */
function checkSession() {
  return new Promise(function(resolve, reject) {
    wx.checkSession({
      success: function() {
        resolve(true);
      },
      fail: function() {
        reject(false);
      }
    })
  });
}

module.exports = {
  loginByWeixin,
  checkLogin,
};