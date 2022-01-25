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
    tabs: ["申请售后", "已申请", "处理中", "申请记录"],
    tabDicts: ["SW0801", "SW0802", "SW0804", "SW0800"],
    tabClass: ["", "", "", ""],
    stv: {
      windowWidth: 0,
      lineWidth: 0,
      offset: 0,
      tStart: false
    },
    activeTab: 0,
    loadingStatus: false,
    customerId: '',
    totalOrderList: []
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
    this.getOrderRefundList()
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
  getOrderRefundList: function () {
    var that = this;
    var param = {
      limit: app.globalData.limit,
      page: app.globalData.page,
      customerId: that.data.customerId,
      type: 'AFTERSALE'
    };
    http('/orderAftersale/getOrderRefundList', param, '', 'post').then(res => {
      if (res.success) {
        that.setData({
          totalOrderList: res.data.orderList,
          logisticsMap: {},
          goodsMap:{}
        });
        //订单分类
        var orderList = [];
        var orders = res.data.orderList
        var orderRefunds = res.data.orderRefundList
        for (let i = 0; i < that.data.tabs.length; i++) {
          var tempList = [];
          if(i == 0){
            tempList = orders
            for (let j = 0; j < orders.length; j++) {
              var receiveTime = orders[j].receiveTime; // '2020-11-19 12:00:00';
              if (receiveTime) {
                receiveTime = receiveTime.replace(/-/g, '/')
                //判断当前时间是否超过售后限制时间
                console.log(receiveTime)
                var receiveDate = new Date(receiveTime);
                var applyDate = new Date(receiveDate.setDate(receiveDate.getDate() + 7)); //7天之后
                var curDate = new Date();
                console.log(applyDate)
                console.log(curDate)
                // 当前时间早于限制时间，可以申请售后
                if (curDate < applyDate) {
                  orders[j].canApply = true
                } else {
                  orders[j].canApply = false
                }
              } else {
                orders[j].canApply = true
              }
            }
          } else if (i == 3) {
            for (let j = 0; j < orderRefunds.length; j++) {
              if (orderRefunds[j].aftersaleStatus != 'SW0802' && orderRefunds[j].aftersaleStatus != 'SW0804') {
                tempList.push(orderRefunds[j])
              }
            }
          } else {
            for (let j = 0; j < orderRefunds.length; j++) {
              if (orderRefunds[j].aftersaleStatus == that.data.tabDicts[i]) {
                tempList.push(orderRefunds[j])
              }
            }
          }
          orderList.push({ 'status': i, 'isnull': tempList.length === 0, 'isOrder': i == 0,'orderServiceList': tempList })
        }
        this.setData({
          orderList: orderList
        });
        console.log(orderList)
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
  clickOrderSaleDetail: function (e) {
    var query = {
      id: e.currentTarget.dataset.id
    }
    wx.navigateTo({
      url: '/pages/my/order-refund-check/orderRefundCheck?param=' + JSON.stringify(query)
    })
  },
  cancelApply: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var orderId = e.currentTarget.dataset.orderid;
    var orderDetailId = e.currentTarget.dataset.orderdetailid;
    wx.showModal({
      title: '确定要取消该申请单吗？',
      content: '',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({
            mask: true
          });
          var param = {
            id: id,
            orderId: orderId,
            orderDetailId: orderDetailId
          }
          http('/orderAftersale/cancelOrderAftersale', param, '', 'post').then(res => {
            wx.hideLoading();
            if(res.success){
              that.onShow();
            }else{
              dialog.dialog('错误', '取消申请单异常，请联系管理员!', false, '确定');
            }
          })
        }
      }
    })
  },
  deleteApply: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var orderId = e.currentTarget.dataset.orderid;
    var orderDetailId = e.currentTarget.dataset.orderdetailid;
    wx.showModal({
      title: '确定要删除该申请单吗？',
      content: '',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({
            mask: true
          });
          var param = {
            id: id,
            orderId: orderId,
            orderDetailId: orderDetailId
          }
          http('/orderAftersale/deleteOrderAftersale', param, '', 'post').then(res => {
            wx.hideLoading();
            if(res.success){
              that.onShow();
            }else{
              dialog.dialog('错误', '删除申请单异常，请联系管理员!', false, '确定');
            }
          })
        }
      }
    })
  },
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
    let { tabs, stv, activeTab } = this.data;
    activeTab = page;
    this.setData({ activeTab: activeTab })
    stv.offset = stv.windowWidth * activeTab;
    this.setData({ stv: this.data.stv })
  },
  handlerTabTap(e) {
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

  deliverOrder: function (e) {
    var query = {
      id: e.currentTarget.dataset.id,
      aftersaleNo: e.currentTarget.dataset.no,
      applyTime: e.currentTarget.dataset.time,
      attributes: e.currentTarget.dataset.attr,
      goodsName: e.currentTarget.dataset.name,
      applyNum: e.currentTarget.dataset.num,
      pic: e.currentTarget.dataset.pic 
    }
    wx.navigateTo({
      url: '/pages/my/order-refund-delivery/orderRefundDelivery?param=' + JSON.stringify(query)
    })
  },

  /**
   * 
   * @param 无法申请售后点击申请售后按钮提示 
   */
  canNotApply: function (e) {
    dialog.dialog('提示', '该商品已经超过售后期，无法申请售后！', false, '确定');
  },

  /**
   * 跳转到选择退款类型页面
   * @param {订单明细ID} e 
   */
  toRefundPage: function(e) {
    var query = {
      orderDetailId: e.currentTarget.dataset.id,
      orderId: e.currentTarget.dataset.orderid,
      quantity: e.currentTarget.dataset.quantity,
      attributes: e.currentTarget.dataset.attributes,
      goodsName: e.currentTarget.dataset.goodsname,
      goodsPrice: e.currentTarget.dataset.goodsprice,
      pic: e.currentTarget.dataset.pic 
    }
    wx.navigateTo({
      url: '/pages/my/order-refund-type/orderRefundType?param=' + JSON.stringify(query)
    })
  },
})