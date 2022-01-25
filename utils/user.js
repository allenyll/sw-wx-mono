/**
 * 用户相关服务
 */
const app = getApp();
const util = require('../utils/util.js');
const api = require('../config/api.js');


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
function loginByWeixin(userInfo) {
  // let shareUserId = wx.getStorageSync('shareUserId');
  // if (!shareUserId || shareUserId =='undefined'){
  //   shareUserId = 1;
  // }
  return new Promise(function(resolve, reject) {
    return login().then((res) => {
      getToken(res, userInfo).then((res) => {
        if (res.success) {
          //更新登录的用户的相关信息到数据库
          // http('/customer/updateCustomer', userInfo, '', 'post').then(res => {
          //   if (res.success) {
          //     //存储用户信息
          //     wx.setStorageSync('userInfo', res.data.userInfo);
          //     resolve(res);
          //   } else {
          //     dialog.dialog('警告', res.message, false, '确定');
          //   }
          // });
        }
      });
    }).catch((err) => {
      reject(err);
    })
  });
}

function getToken(res, userInfo) {
  return new Promise(function(resolve, reject) {
    if (res.code) {
      wx.request({
        url: app.globalData.authUrl+'/wx/auth/token',
        data: {
          code: res.code,
          mode: 'sweb_wx',
          userInfo: userInfo
        },
        method: "POST",
        header: {
          'content-type': 'application/json',
          'login-type': 'wx'
        },
        success: function (res) {
          var token = res.data.data.accessToken;
          var openid = res.data.data.openid;
          app.globalData.token = token;
          wx.setStorageSync('openid', openid);
          wx.setStorageSync('token', token);
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

module.exports = {
  loginByWeixin,
  checkLogin,
};