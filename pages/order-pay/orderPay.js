const http = require('../../utils/http.js')  // 引入
var wxpay = require('../../utils/pay.js')
const dialog = require('../../utils/dialog.js')  // 引入
//获取应用实例
var app = getApp()

Page({
  data: {
    goodsList: [],
    isNeedLogistics: 0, // 是否需要物流信息
    allGoodsPrice: 0,
    yunPrice: 0,
    logisticsFee: 0,
    totalAmount: 0,
    goodsJsonStr: "",
    orderType: "", //订单类型，购物车下单或立即支付下单，默认是购物车，
    pageType: "now",
    hasNoCoupons: true,
    coupons: [],
    youhuijine: 0, //优惠券金额
    curCoupon: null, // 当前选择使用的优惠券,
    couponDesc: '',
    couponId: '',
    couponAmount: 0,     // 优惠券优惠金额
    promotionAmount: 0,  // 商品促销金额
    discountAmount: 0,    // 商品折扣金额
    integrationAmount: 0
  },
  onShow: function () {
    var that = this;
    var cartList = [];
    //立即购买下单
    if ("buyNow" === that.data.orderType) {
      console.log('buyNow!!')
      var buyNowInfoMem = wx.getStorageSync('buyNowInfo');
      //that.data.kjId = buyNowInfoMem.kjId;
      if (buyNowInfoMem && buyNowInfoMem.cartList) {
        cartList = buyNowInfoMem.cartList
      }
    } else {
      //购物车下单
      var shopCarInfoMem = wx.getStorageSync('cartInfo');
      //that.data.kjId = shopCarInfoMem.kjId;
      if (shopCarInfoMem && shopCarInfoMem.cartList) {
        cartList = shopCarInfoMem.cartList.filter(entity => {
          return entity.active;
        });
      }
    }
    that.setData({
      goodsList: cartList,
    });
    that.initAddress();
    that.getCoupon();
    that.getCouponData();
    that.dealPrice();
  },

  onLoad: function (e) {
    var that = this;
    //显示收货地址标识
    that.setData({
      navHeight: app.globalData.navHeight,
      isNeedLogistics: 1,
      orderType: e.orderType
    });
    //每次重新加载界面，清空数据
    app.globalData.userCoupon = 'NO_USE_COUPON'
    app.globalData.courseCouponCode = {}
  },

  /**
   * 获取优惠券
   */
  getCouponData: function () {
    if (app.globalData.userCoupon == 'USE_COUPON') {
      this.setData({
        couponDesc: app.globalData.courseCouponCode.name,
        couponId: app.globalData.courseCouponCode.couponId,
        couponAmount: app.globalData.courseCouponCode.amount
      })
      console.log(app.globalData.courseCouponCode.amount)
    } else if (app.globalData.userCoupon == 'NO_USE_COUPON') {
      this.setData({
        couponDesc: "不使用优惠券",
        couponId: '',
        couponAmount: 0
      })
    }
  },

  getDistrictId: function (obj, aaa) {
    if (!obj) {
      return "";
    }
    if (!aaa) {
      return "";
    }
    return aaa;
  },

  createOrder: function (e) {
    var that = this;
    wx.showLoading();
    var remark = ""; // 备注信息
    if (e) {
      remark = e.detail.value.remark; // 备注信息
    }

    var param = {
      goodsJsonStr: that.data.goodsJsonStr,
      remark: remark
    };
    if (that.data.isNeedLogistics > 0) {
      if (!that.data.curAddressData) {
        wx.hideLoading();
        dialog.dialog('错误', '请先设置您的收货地址！', false, '确定');
        return;
      }
      param.province = that.data.curAddressData.province;
      param.city = that.data.curAddressData.city;
      if (that.data.curAddressData.region) {
        param.region = that.data.curAddressData.region;
      }
      param.detailAddress = that.data.curAddressData.detailAddress;
      param.name = that.data.curAddressData.name;
      param.phone = that.data.curAddressData.phone;
      param.postCode = that.data.curAddressData.postCode;
      param.addressId = that.data.curAddressData.id;
      param.goodsList = JSON.stringify(that.data.goodsList);
      const list = that.data.goodsList;
      var giftGrowth = 0;
      var goodsIntegral = 0;
      var goodsCount = 0;
      if(list.length > 0){
        for (var i = 0; i < list.length; i++){
          giftGrowth += list[i].giftGrowth;
          goodsIntegral += list[i].goodsIntegral;
          goodsCount +=list[i].number;
        }
      }
      param.goodsIntegral = goodsIntegral;
      param.giftGrowth = giftGrowth;
      param.goodsCount = goodsCount;
    }
    param.logisticsFee = that.data.logisticsFee;
    param.totalAmount = that.data.totalAmount;
    param.allGoodsPrice = that.data.allGoodsPrice;
    param.couponId = that.data.couponId;
    param.couponAmount = that.data.couponAmount;
    param.discountAmount = that.data.discountAmount;
    param.promotionAmount = that.data.promotionAmount;
    param.integrationAmount = that.data.integrationAmount;
    param.customerId = app.globalData.userInfo.id;
    if (!e) {
      param.calculate = "true";
    }

    console.log(param)
    http('/order/createOrder', param, null, 'post').then(res => {
      if(res.success){
        wx.hideLoading();
        if ("buyNow" != that.data.orderType) {
          // 清空购物车数据
          wx.removeStorageSync('cartInfo');
        }
        that.data.orderId = res.data.order.id;
        // 发起支付
        wxpay.wxpay(app, this.data.totalAmount, this.data.orderId, '/pages/my/order-list/order', "order");
        // 跳转到支付页
      //   wx.redirectTo({
      //      url: "/pages/pay/pay?orderId="+res.order.id+"&totalAmount="+that.data.totalAmount
      //  });
      }else{
        wx.hideLoading();
        dialog.dialog('错误', '订单创建失败', false, '确定');
      }
    });
  },

  initAddress: function () {
    var that = this;
    var param = {
      customerId: app.globalData.userInfo.id
    }
    http('/customerAddress/getAddressList', param, null, 'post').then(res => {
      if (res.success) {
        if(res.data.length > 0){
          for(let i=0; i < res.data.length; i++) {
            var mark = res.data[i].isDefault;
            if(that.data.pageType == 'back'){
              mark = res.data[i].isSelect
            }
            if(mark == 'SW1001'){
              that.setData({
                curAddressData: res.data[i]
              });
            }
            if(this.data.curAddressData == undefined){
              that.setData({
                curAddressData: res.data[0]
              });
            }
          }
        } else {
          that.setData({
            curAddressData: null
          })
        }
        //that.processYunfei();
      } else {
        dialog.dialog('错误', '获取收货地址失败，请联系管理员!', false, '确定');
      }
    });
  },

  dealPrice: function() {
    var that = this;
    var goodsList = that.data.goodsList;
    var _couponAmount = that.data.couponAmount;
    console.log(_couponAmount)
    var isNeedLogistics = 0;
    var allGoodsPrice = 0;
    var _logisticsFee = 0;
    for (let i = 0; i < goodsList.length; i++) {
      let carShopBean = goodsList[i];
      allGoodsPrice += carShopBean.price * carShopBean.number;
    }
    // 满599包邮
    if(allGoodsPrice < 599){
      _logisticsFee = 5
    }
    that.setData({
      allGoodsPrice: allGoodsPrice,
      logisticsFee: _logisticsFee,
      totalAmount: allGoodsPrice + _logisticsFee - _couponAmount
    })
  },

  getCoupon: function() {
    var param = {
      customerId: app.globalData.userInfo.id
    }
    http('/coupon/getCouponList', param, null, 'post').then(res => {
      if (res.success) {
        const coupons = res.data.list;
        if (coupons.length > 0) {
          this.setData({
            hasNoCoupons: false,
            coupons: coupons
          });
        }
      } else {
        dialog.dialog('错误', '获取优惠券失败', false, '确定');
      }
    });
  },

  processYunfei: function () {
    var that = this;
    var goodsList = this.data.goodsList;
    var goodsJsonStr = "[";
    var isNeedLogistics = 0;
    var allGoodsPrice = 0;
    console.log(goodsList)
    for (let i = 0; i < goodsList.length; i++) {
      let carShopBean = goodsList[i];
      console.log(carShopBean.logistics)
      if (carShopBean.logistics) {
        isNeedLogistics = 1;
      }
      allGoodsPrice += carShopBean.price * carShopBean.number;

      var goodsJsonStrTmp = '';
      if (i > 0) {
        goodsJsonStrTmp = ",";
      }
      goodsJsonStrTmp += '{"goodsId":"' + carShopBean.goodsId + '","number":' + carShopBean.number + ',"specValue":"' + carShopBean.specValue + '","logisticsType":0}';
      goodsJsonStr += goodsJsonStrTmp;
    }
    goodsJsonStr += "]";
    that.setData({
      isNeedLogistics: isNeedLogistics,
      goodsJsonStr: goodsJsonStr
    });
    that.setData({
      allGoodsPrice: allGoodsPrice
    })
    that.createOrder();
  },

  addAddress: function () {
    wx.navigateTo({
      url: "/pages/add-address/addAddress"
    })
  },
  selectAddress: function () {
    wx.navigateTo({
      url: "/pages/address/address?page=orderPay"
    })
  },
  /**
  * 选择可用优惠券
  */
  tapCoupon: function () {
    let that = this

    wx.navigateTo({
      url: '../selCoupon/selCoupon?buyType=' + that.data.orderType,
    })
  },

  wxPay: function() {
    this.createOrder();
  },

  balancePay: function() {
    dialog.dialog('提示', '暂不支持余额支付', false, '确定');
  },

  bindChangeCoupon: function (e) {
    const selIndex = e.detail.value[0] - 1;
    if (selIndex === -1) {
      this.setData({
        youhuijine: 0,
        curCoupon: null
      });
      return;
    }
    //console.log("selIndex:" + selIndex);
    this.setData({
      youhuijine: this.data.coupons[selIndex].money,
      curCoupon: this.data.coupons[selIndex]
    });
  },
})
