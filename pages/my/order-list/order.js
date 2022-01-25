const http = require('../../../utils/http.js')  // 引入
const dialog = require('../../../utils/dialog.js')  // 引入
var wxpay = require('../../../utils/pay.js')
var app = getApp()
Page({
  data: {
    showBack: false,
    // scroll-view 返回顶部设置需要
    topNum: 0,
    tabIndex: 0,
    tabs: ["所有订单", "待付款", "待发货", "待收货", "待评价"],
    tabDicts: ["SW0700", "SW0701", "SW0702", "SW0703", "SW0704"],
    tabClass: ["", "", "", "", ""],
    stv: {
      windowWidth: 0,
      lineWidth: 0,
      offset: 0,
      tStart: false
    },
    activeTab: 0,
    loadingStatus: false,
    customerId: '',
    totalOrderList: [],
    show: false,
    radio: '我不想买了',
    cancelReasonList: [
      {
        id: 0,
        reason: '我不想买了'
      },
      {
        id: 1,
        reason: '信息填写错误(地址、联系人、支付方式等)'
      },
      {
        id: 2,
        reason: '重复下单/误下单'
      },
      {
        id: 3,
        reason: '对价格不满意，等降价再买'
      },
      {
        id: 4,
        reason: '未参与优惠，重新购买'
      },
      {
        id: 5,
        reason: '商品取货，无法支付'
      },
      {
        id: 6,
        reason: '其他'
      },
    ],
    currentOrderId: ''
  },
  onLoad: function (options) {
    this.setData({ 
      navHeight: app.globalData.navHeight
    })
    var type = options.type
    try {
      let { tabs } = this.data;
      var res = wx.getSystemInfoSync()
      this.windowWidth = res.windowWidth;
      this.data.stv.lineWidth = this.windowWidth / this.data.tabs.length;
      this.data.stv.windowWidth = res.windowWidth;
      var index = this.getArrayIndex(this.data.tabDicts, type)
      console.log(index)
      this.setData({ 
        stv: this.data.stv, 
        customerId: options.id,
        tabIndex: index
      })
      this.tabsCount = tabs.length;
    } catch (e) {
    }
  },
  onShow: function () {
    // 获取订单列表
    this.setData({
      loadingStatus: true
    })
    // this.getOrderStatistics();
    this.getOrderList()
    this._updateSelectedPage(this.data.tabIndex)
  },
  /**
   * 获取滚动条当前位置 scroll-view 
   * @param {*} e 
   */
  scrollFn: function(e){
    console.log(e)
    if (e.detail.scrollTop > 400) {
      this.setData({
        showBack: true
      })
    } else {
      this.setData({
        showBack: false
      })
    }
  },
  /**
   * 隐藏返回顶部按钮 scroll-view
   * @param e 
   */
  showBack: function(e) {
    console.log(e)
    this.setData({
      showBack: false,
      topNum: 0
    })
  },
  /*
  * 获取某个元素下标
  * arr: 传入的数组
  * obj: 需要获取下标的元素
  * */
  getArrayIndex(arr, obj) {
    var i = arr.length;
    while (i--) {
        if (arr[i] === obj) {
            return i;
        }
    }
    return -1;
  },
  getOrderStatistics: function () {
    var that = this;
    var param = {
      customerId: that.data.customerId
    }
    http('/order/getOrderNum', param, '', 'post').then(res => {
      if (res.success) {
        var tabClass = that.data.tabClass;
        if (res.data.unPayNum> 0) {
          tabClass[0] = "red-dot"
        } else {
          tabClass[0] = ""
        }
        if (res.data.unReceiveNum > 0) {
          tabClass[1] = "red-dot"
        } else {
          tabClass[1] = ""
        }
        if (res.data.deliveryNum > 0) {
          tabClass[2] = "red-dot"
        } else {
          tabClass[2] = ""
        }
        if (res.data.appraisesNum > 0) {
          tabClass[3] = "red-dot"
        } else {
          tabClass[3] = ""
        }
        if (res.data.finishNum > 0) {
          //tabClass[4] = "red-dot"
        } else {
          //tabClass[4] = ""
        }

        console.log(tabClass)
        that.setData({
          tabClass: tabClass,
        });
      }else{
        dialog.dialog('错误', '获取订单数量异常', false, '确定');
      }
    });
  },
  getOrderList: function () {
    var that = this;
    var param = {
      limit: app.globalData.limit,
      page: app.globalData.page,
      customerId: that.data.customerId
    };
    console.log('getting orderList')
    http('/order/getOrderList', param, '', 'post').then(res => {
      if (res.success) {
        that.setData({
          totalOrderList: res.data.list,
          logisticsMap: {},
          goodsMap:{}
        });
        //订单分类
        var orderList = [];
        for (let i = 0; i < that.data.tabs.length; i++) {
          var tempList = [];
          for (let j = 0; j < res.data.list.length; j++) {
            if (res.data.list[j].orderStatus == that.data.tabDicts[i]) {
              tempList.push(res.data.list[j])
            }
            if(i == 0){
              tempList.push(res.data.list[j])
            }
          }
          orderList.push({ 'status': i, 'isnull': tempList.length === 0, 'orderList': tempList })
        }
        this.setData({
          orderList: orderList
        });
        console.log(that.data.orderList)
      } else {
        that.setData({
          orderList: 'null',
          logisticsMap: {},
          goodsMap: {}
        });
        dialog.dialog('错误', '获取订单异常', false, '确定');
      }
      this.setData({
        loadingStatus: false
      })
    });
  },
  clickOrderDetail: function (e) {
    var orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/order-details/orderDetails?id=" + orderId
    })
  },
  cancelOrderTap: function (e) {
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确定要取消该订单吗？',
      content: '',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({
            mask: true
          });
          var param = {
            note: that.data.radio,
            orderId: orderId
          }
          http('/order/cancelMiniOrder', param, '', 'post').then(res => {
            wx.hideLoading();
            that.onClose();
            if(res.success){
              that.onShow();
            }else{
              dialog.dialog('错误', '取消订单异常，请联系管理员!', false, '确定');
            }
          })
        }
      }
    })
  },
  toPayTap: function (e) {
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    var money = e.currentTarget.dataset.money;
    var integration = e.currentTarget.dataset.integration;
    wxpay.wxpay(app, money, orderId, '/pages/my/order-list/order', "order");
  },
  deleteTap(e) {
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确定要删除该订单吗？',
      content: '',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading();
          http('/order/deleteOrder/' + orderId, '', '', 'post').then(res => {
            wx.hideLoading();
            if (res.success) {
              that.onShow();
            } else {
              dialog.dialog('错误', '删除订单异常，请联系管理员!', false, '确定');
            }
          })
        }
      }
    })
  },
  receiveOrderTap(e) {
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认已收到货？',
      content: '',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading();
          http('/order/receiveOrder/' + orderId, '', '', 'post').then(res => {
            wx.hideLoading();
            if (res.success) {
              that.onShow();
            } else {
              dialog.dialog('错误', '订单确认收货异常，请联系管理员!', false, '确定');
            }
          })
        }
      }
    })
  },
  appraiseOrderTap(e){
    var orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/comment/comment?orderId=' + orderId,
    })
  },
  ////////
  handlerStart(e) {
    console.log('handlerStart')
    let { clientX, clientY } = e.touches[0];
    this.startX = clientX;
    this.tapStartX = clientX;
    this.tapStartY = clientY;
    this.data.stv.tStart = true;
    this.tapStartTime = e.timeStamp;
    this.setData({ stv: this.data.stv })
  },
  handlerMove(e) {
    console.log('handlerMove')
    let { clientX, clientY } = e.touches[0];
    let { stv } = this.data;
    let offsetX = this.startX - clientX;
    this.startX = clientX;
    stv.offset += offsetX;
    if (stv.offset <= 0) {
      stv.offset = 0;
    } else if (stv.offset >= stv.windowWidth * (this.tabsCount - 1)) {
      stv.offset = stv.windowWidth * (this.tabsCount - 1);
    }
    this.setData({ stv: stv });
  },
  handlerCancel(e) {

  },
  handlerEnd(e) {
    console.log('handlerEnd')
    let { clientX, clientY } = e.changedTouches[0];
    let endTime = e.timeStamp;
    let { tabs, stv, activeTab } = this.data;
    let { offset, windowWidth } = stv;
    //快速滑动
    if (endTime - this.tapStartTime <= 300) {
      console.log('快速滑动')
      //判断是否左右滑动(竖直方向滑动小于50)
      if (Math.abs(this.tapStartY - clientY) < 50) {
        //Y距离小于50 所以用户是左右滑动
        console.log('竖直滑动距离小于50')
        if (this.tapStartX - clientX > 5) {
          //向左滑动超过5个单位，activeTab增加
          console.log('向左滑动')
          if (activeTab < this.tabsCount - 1) {
            this.setData({ activeTab: ++activeTab })
          }
        } else if (clientX - this.tapStartX > 5) {
          //向右滑动超过5个单位，activeTab减少
          console.log('向右滑动')
          if (activeTab > 0) {
            this.setData({ activeTab: --activeTab })
          }
        }
        stv.offset = stv.windowWidth * activeTab;
      } else {
        //Y距离大于50 所以用户是上下滑动
        console.log('竖直滑动距离大于50')
        let page = Math.round(offset / windowWidth);
        if (activeTab != page) {
          this.setData({ activeTab: page })
        }
        stv.offset = stv.windowWidth * page;
      }
    } else {
      let page = Math.round(offset / windowWidth);
      if (activeTab != page) {
        this.setData({ activeTab: page })
      }
      stv.offset = stv.windowWidth * page;
    }
    stv.tStart = false;
    this.setData({ stv: this.data.stv })
  },
  ////////
  _updateSelectedPage(page) {
    console.log('_updateSelectedPage')
    let { tabs, stv, activeTab } = this.data;
    activeTab = page;
    this.setData({ activeTab: activeTab })
    stv.offset = stv.windowWidth * activeTab;
    this.setData({ stv: this.data.stv })
  },
  handlerTabTap(e) {
    this.setData({
      showBack: false,
      topNum: 0
    })
    this._updateSelectedPage(e.currentTarget.dataset.index);
  },
  //事件处理函数
  swiperchange: function (e) {
    console.log('swiperCurrent',e.detail.current)
    let { tabs, stv, activeTab } = this.data;
    activeTab = e.detail.current;
    this.setData({ activeTab: activeTab })
    stv.offset = stv.windowWidth * activeTab;
    this.setData({ stv: this.data.stv })
  },
  toIndexPage: function () {
    wx.switchTab({
      url: "/pages/classification/index"
    });
  },
  getCancelReason: function (e) {
    var orderId = e.currentTarget.dataset.id;
    this.setData({
      show: true,
      currentOrderId: orderId
    })
  },
  onClose() {
    this.setData({ show: false });
  },

  onChange(event) {
    this.setData({
      radio: event.detail,
    });
  },

  onClick(event) {
    const { name } = event.currentTarget.dataset;
    this.setData({
      radio: name,
    });
  },
  // 加载更多
  scrollHandler: function () {
    console.log("fenye-----")
    // if(this.data.lastpage > page){
    //   this.loadData(page); 
    // }else{
    //   wx.showModal({
    //     title: '到底了',
    //     content: '请休息一会再看呗！',
    //   })
    // }
  },
})