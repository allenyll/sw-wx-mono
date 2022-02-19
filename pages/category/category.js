const http = require('../../utils/http.js')  // 引入
const dialog = require('../../utils/dialog.js')  // 引入
var app = getApp()
Page({
  data: {
    navList: [],
    goodsList: [],
    id: 0,
    currentCategory: {},
    scrollLeft: 0,
    scrollTop: 0,
    scrollHeight: 0,
    page: 1,
    size: 10,
    loadmoreText: '正在加载更多数据',
    nomoreText: '全部加载完成',
    nomore: false,
    totalPages: 1,
    hasGoods: false
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    that.setData({ 
      navHeight: app.globalData.navHeight
    })
    if (options.id) {
      that.setData({
        id: options.id
      });
    }

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: res.windowHeight
        });
      }
    });
    this.getCategoryInfo();
  },
  getCategoryInfo: function () {
    let that = this;
    
    http('/wx/category/getCategoryInfo/' + this.data.id, null, '', 'get')
      .then(function (res) {
        if (res.success) {
          that.setData({
            navList: res.data.list,
            currentCategory: res.data.obj
          });

          //nav位置
          let currentIndex = 0;
          let navListCount = that.data.navList.length;
          for (let i = 0; i < navListCount; i++) {
            currentIndex += 1;
            if (that.data.navList[i].id == that.data.id) {
              break;
            }
          }
          if (currentIndex > navListCount / 2 && navListCount > 5) {
            that.setData({
              scrollLeft: currentIndex * 60
            });
          }
          that.getGoodsList();
          
        } else {
          //显示错误信息
        }
        
      });
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    console.log(1);
  },
  onHide: function () {
    // 页面隐藏
  },

  onPullDownRefresh(){
      // 显示顶部刷新图标
      wx.showNavigationBarLoading();
      // 增加下拉刷新数据的功能
      var self = this;
      //this.getGoodsList();
      // 隐藏导航栏加载框
      wx.hideNavigationBarLoading();
      // 停止下拉动作
      wx.stopPullDownRefresh();
  },

  /**
     * 页面上拉触底事件的处理函数
     */
  onReachBottom: function () {
    console.log("下一页")
    this.getGoodsList()
  },

  getGoodsList: function () {
    var that = this;
    wx.showLoading({
      title: '加载中...',
    })
    if (that.data.totalPages <= that.data.page-1) {
      that.setData({
        nomore: true
      })
      return;
    }

    http("/wx/goods/getGoods", {categoryId: that.data.id, page: that.data.page, limit: that.data.size}, '', 'post')
      .then(function (res) {
        if(res.success){
          that.setData({
            goodsList: that.data.goodsList.concat(res.data.goods),
            page: res.data.currentPage + 1,
            totalPages: res.data.totalPage
          });
          if (that.data.goodsList.length === 0) {
            that.setData({
              hasGoods: true
            });
          } else {
            that.setData({
              hasGoods: false
            });
          }
          wx.hideLoading({})
        }else{
          // 获取商品失败
          wx.hideLoading({})
        }
      });
  },
  onUnload: function () {
    // 页面关闭
  },
  switchCate: function (event) {
    if (this.data.id == event.currentTarget.dataset.id) {
      return false;
    }
    var that = this;
    var clientX = event.detail.x;
    var currentTarget = event.currentTarget;
    if (clientX < 60) {
      that.setData({
        scrollLeft: currentTarget.offsetLeft - 60
      });
    } else if (clientX > 330) {
      that.setData({
        scrollLeft: currentTarget.offsetLeft
      });
    }
    this.setData({
      id: event.currentTarget.dataset.id,
      page:1,
      totalPages: 1,
      goodsList: [],
      nomore: false
    });
    
    this.getCategoryInfo();
  }
})