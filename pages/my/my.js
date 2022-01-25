// pages/my/my.js
//获取应用实例
const http = require('../../utils/http.js')  // 引入
const dialog = require('../../utils/dialog.js')  // 引入
const user = require('../../utils/user.js')  // 引入
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    hasUserInfo: false,
    hasLogin: false,
    canIUseGetUserProfile: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    showPhone: false,
    phone: '',
    point: 0,
    balance: 0,
    unPayNum: '',
    unReceiveNum: '',
    deliveryNum: '',
    appraisesNum: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
    this.setData({ 
      navHeight: app.globalData.navHeight
    })
  },
  getUserProfile(e) {
    let that = this
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        user.checkLogin().catch(() => {
          user.loginByWeixin(res.userInfo).then(res => {
            app.globalData.hasLogin = true;
            that.setData({
              userInfo: res.userInfo,
              hasLogin: true
            })
            this.queryUserInfo()
            // wx.navigateBack({
            //   delta: 1
            // })
          }).catch((err) => {
            app.globalData.hasLogin = false;
            util.showErrorToast('微信登录失败');
          });
        });
      },
      fail: (res) => {
        app.globalData.hasLogin = false;
        util.showErrorToast('微信登录失败');
      }
    })
  },

  getUserInfo: function (e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    this.setData({
      userInfo: e.detail.userInfo,
      hasLogin: true
    })
    if (e.detail.userInfo) {
      e.detail.userInfo.openid = wx.getStorageSync('openid')
      //用户按了允许授权按钮
      var that = this;
      //插入登录的用户的相关信息到数据库
      http('/customer/updateCustomer', e.detail.userInfo, '', 'post').then(res => {
        if (res.success) {
          //从数据库获取用户信息
          that.queryUserInfo();
        } else {
          dialog.dialog('警告', res.message, false, '确定')
        }
      })
      //授权成功后，跳转进入小程序首页
      // wx.switchTab({
      //     url: '/pages/my/my'  
      // })
    } else {
      //用户按了拒绝按钮
      dialog.dialog('警告', '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!', false, '返回授权')
    }
  },

  queryUserInfo: async function(){
    var that = this;
    var openid = await wx.getStorageSync('openid');
    await that.getUser(openid);
    await that.getOrderStatistics();
  },

  getUser: function(openid) {
    var that = this
    return new Promise((resolve, reject) => {
      http('/customer/queryUserByOpenId?openid=' + openid,'', '', 'post').then(res => {
        if (!res.success) {
          dialog.dialog('警告', '授权失败!!!', false, '返回授权')
          reject('授权失败!!!')
          return
        }
        var user = res.data;
        if (undefined == user) {
          dialog.dialog('警告', '授权失败!!!', false, '返回授权')
          reject('授权失败!!!')
          return
        }
        var customerPoint = user.customerPoint;
        var point = 0;
        if (undefined != customerPoint) {
          point = customerPoint.point;
        }
        var customerBalance = user.customerBalance;
        var balance = 0;
        if (undefined != customerBalance) {
          balance = customerBalance.balance;
        }
        app.globalData.userInfo = user;
        if (null != user.phone && '' != user.phone) {
          var phoneNumber = user.phone
          that.setData({
            showPhone: true,
            phone: phoneNumber.substring(0, 3) + '******' + phoneNumber.substring(9, 11)
          })
        }
        that.setData({
          userInfo: app.globalData.userInfo,
          hasUserInfo: true,
          point: point,
          balance: balance
        })
        resolve(res)
      })
    })
  },

  getOrderStatistics: function () {
    var that = this;
    var param = {
      customerId: app.globalData.userInfo.id
    }
    return new Promise((resolve, reject) => {
      http('/order/getOrderNum', param, '', 'post').then(res => {
        if (res.success) {
          if (res.data.unPayNum > 0) {
            that.setData({
              unPayNum: res.data.unPayNum
            })
          } else {
            that.setData({
              unPayNum: ''
            })
          }
          if (res.data.unReceiveNum > 0) {
            that.setData({
              unReceiveNum: res.data.unReceiveNum
            })
          } else {
            that.setData({
              unReceiveNum: ''
            })
          }
          if (res.data.deliveryNum > 0) {
            that.setData({
              deliveryNum: res.data.deliveryNum
            })
          } else {
            that.setData({
              deliveryNum: ''
            })
          }
          if (res.data.appraisesNum > 0) {
            that.setData({
              appraisesNum: res.data.appraisesNum
            })
          } else {
            that.setData({
              appraisesNum: ''
            })
          }
          if (res.data.finishNum > 0) {
            //tabClass[4] = "red-dot"
          } else {
            //tabClass[4] = ""
          }
          resolve(res)
        }else{
          reject(获取订单数量异常)
          dialog.dialog('错误', '获取订单数量异常', false, '确定');
        }
      })
    })
  },

  /**
   * 获取用户手机号
   */
  getPhoneNumber: function(e){
    var that = this;
    if(undefined != e.detail.iv){
      wx.login({
        success: res => {
          if (res.code) {
            const param = {
              code: res.code,
              mode: 'sweb_wx',
              iv: e.detail.iv,
              encryptedData: e.detail.encryptedData
            }
            http('/customer/getPhoneNumber', param, '', 'post').then(res => {
              that.queryUserInfo();
              //用户已经授权过
              // wx.switchTab({
              //   url: '/pages/my/my'
              // })
            })
          }
        }
      })
    }else{
      dialog.dialog('警告', '授权失败', false, '绑定手机失败，请重新授权绑定')
    }
  },

  setAccount: function(){
    var that = this;
    if (that.data.hasUserInfo == false || app.globalData.userInfo == null) {
      var url = '/pages/my/account/account'
      var query = {
        url: url,
        type: '',
        page: 'account'
      }
      wx.navigateTo({
        url: '/pages/login/login?param=' + JSON.stringify(query),
      })
    } else {
      wx.navigateTo({
        url: '/pages/my/account/account?id=' + escape(app.globalData.userInfo.id),
      })
    }
  },

  /**
   * 积分详情页面
   */
  clickPoint: function() {
    var that = this;
    if (that.data.hasUserInfo == false || app.globalData.userInfo == null) {
      var url = '/pages/my/point/point'
      var query = {
        url: url,
        type: '',
        page: 'point'
      }
      wx.navigateTo({
        url: '/pages/login/login?param=' + JSON.stringify(query),
      })
    } else {
      wx.navigateTo({
        url: '/pages/my/point/point?id=' + escape(app.globalData.userInfo.id),
      })
    }
  },

  clickCash: function() {
    // var that = this;
    // if (that.data.hasUserInfo == false || app.globalData.userInfo == null) {
    //   wx.navigateTo({
    //     url: '/pages/login/login?mark=/pages/my/cash/cash',
    //   })
    // } else {
    //   wx.navigateTo({
    //     url: '/pages/my/cash/cash?id=' + escape(app.globalData.userInfo.id),
    //   })
    // }
    dialog.dialog('提示', '功能正在开发中，请耐心等待', false, '确定')
  },

  clickVip: function() {
    wx.navigateTo({
      url: '/pages/my/vip/vip',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  clickWithdraw: function() {
    dialog.dialog('提示', '功能正在开发中，请耐心等待', false, '确定')
  },

  /**
   * 订单管理点击事件
   */
  clickOrder: function(event){
    var that = this;
    var type = event.currentTarget.dataset.type
    if (that.data.hasUserInfo == false || app.globalData.userInfo == null) {
      var url = '/pages/my/order-list/order'
      if ('SW0801' === type) {
        url = '/pages/my/order-refund/orderRefund'
      }
      var query = {
        url: url,
        type: type,
        page: 'order'
      }
      wx.navigateTo({
        url: '/pages/login/login?param=' + JSON.stringify(query),
      })
    }else{
      var url = '/pages/my/order-list/order?id=' + escape(app.globalData.userInfo.id) + '&type='+type
      if ('SW0801' === type) {
        url = '/pages/my/order-refund/orderRefund?id=' + escape(app.globalData.userInfo.id) + '&type='+type
      }
      wx.navigateTo({
        url: url,
      })
    }
  },

  /**
   * 地址管理点击事件
   */
  clickAddress: function () {
    var that = this;
    if (that.data.hasUserInfo == false || app.globalData.userInfo == null) {
      var url = '/pages/address/address'
      var query = {
        url: url,
        type: '',
        page: 'address'
      }
      wx.navigateTo({
        url: '/pages/login/login?param=' + JSON.stringify(query),
      })
    } else {
      wx.navigateTo({
        url: '/pages/address/address?id=' + escape(app.globalData.userInfo.id) + '&page=my',
      })
    }
  },

  /**
   * 优惠券管理点击事件
   */
  clickCoupon: function () {
    var that = this;
    console.log(app.globalData.userInfo)
    if (that.data.hasUserInfo == false || app.globalData.userInfo == null) {
      var url = '/pages/my/coupon/coupon'
      var query = {
        url: url,
        type: '',
        page: 'coupon'
      }
      wx.navigateTo({
        url: '/pages/login/login?param=' + JSON.stringify(query),
      })
    } else {
      wx.navigateTo({
        url: '/pages/my/coupon/coupon?id=' + escape(app.globalData.userInfo.id),
      })
    }
  },

   /**
   * 意见反馈点击事件
   */
  clickAboutus: function(){
    wx.navigateTo({
      url: '/pages/my/aboutus/aboutus'
    })
  },

  /**
   * 意见反馈点击事件
   */
  clickFeedback: function(event){
    var that = this;
    var type = event.currentTarget.dataset.type
    if (that.data.hasUserInfo == false || app.globalData.userInfo == null) {
      var url = '/pages/my/feedback/feedback'
      var query = {
        url: url,
        type: '',
        page: 'feedback'
      }
      wx.navigateTo({
        url: '/pages/login/login?param=' + JSON.stringify(query),
      })
    }else{
      wx.navigateTo({
        url: '/pages/my/feedback/feedback?id=' + escape(app.globalData.userInfo.id) + '&type='+type,
      })
    }
  },

  clickPointExchange: function(event) {
    dialog.dialog('提示', '功能正在开发中，请耐心等待', false, '确定')
  },

  /**
   * 足迹点击事件
   */
  clickFootprint: function(event){
    var that = this;
    var type = event.currentTarget.dataset.type
    if (that.data.hasUserInfo == false || app.globalData.userInfo == null) {
      var url = '/pages/my/footprint/footprint'
      var query = {
        url: url,
        type: '',
        page: 'footprint'
      }
      wx.navigateTo({
        url: '/pages/login/login?param=' + JSON.stringify(query),
      })
    }else{
      wx.navigateTo({
        url: '/pages/my/footprint/footprint?id=' + escape(app.globalData.userInfo.id) + '&type='+type,
      })
    }
  },  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    //获取用户的登录信息
    if (app.globalData.hasLogin) {
      let userInfo = wx.getStorageSync('userInfo');
      this.setData({
        userInfo: userInfo,
        hasLogin: true
      });
    }
    // // 查看是否授权
    // wx.getSetting({
    //   success: function (res) {
    //     if (res.authSetting['scope.userInfo']) {
    //       wx.getUserInfo({
    //         success: function (res) {
    //           that.data.hasUserInfo = true;
    //           //从数据库获取用户信息
    //           that.queryUserInfo();
    //           //用户已经授权过
    //           // wx.switchTab({
    //           //   url: '/pages/my/my'
    //           // })
    //         }
    //       });
    //     }
    //   }
    // })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})