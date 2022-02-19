const user = require('utils/user.js')  // 引入

App({
  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function () {
    var that = this;
    let menuButtonObject = wx.getMenuButtonBoundingClientRect();
    wx.getSystemInfo({
      success: res => {
        let statusBarHeight = res.statusBarHeight,
          navTop = menuButtonObject.top,//胶囊按钮与顶部的距离
          navHeight = statusBarHeight + menuButtonObject.height + (menuButtonObject.top - statusBarHeight)*2;//导航高度
        this.globalData.navHeight = navHeight;
        this.globalData.navTop = navTop;
        this.globalData.windowHeight = res.windowHeight;
      },
      fail(err) {
        console.log(err);
      }
    })
  },

  /**
   * 动态设置页面标题
   */
  setPageTitle: function(title) {
    wx.setNavigationBarTitle({
      title: title //页面标题为路由参数
    })
  },

  onShow: function(options) {
    user.checkLogin().then(res => {
      this.globalData.hasLogin = true;
      this.globalData.userInfo = wx.getStorageSync('userInfo');
    }).catch(() => {
      this.globalData.hasLogin = false;
      this.globalData.userInfo = null;
    });
  },

  /**
   * 设置全局变量
   */
  globalData: {
    userInfo:null,
    hasLogin:false,
    openid: 0,  
    token:'',
    baseHttpUrl: 'http://localhost:8088',
    baseUrl: 'https://localhost:8443',
    // baseHttpUrl: 'http://www.allenyll.com:8088',
    // baseUrl: 'https://www.allenyll.com:8443',
    bearer: 'Bearer ',
    logType: ',JWT_WX',
    onLoadStatus: true,
    page: 1,
    limit: 10,
    userCoupon: 'NO_USE_COUPON',//默认不适用优惠券
    courseCouponCode: {},//购买课程的时候优惠券信息
    isIphoneX: false
  }
})
