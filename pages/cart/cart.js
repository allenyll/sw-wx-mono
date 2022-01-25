//index.js
const http = require('../../utils/http.js')  // 引入
const dialog = require('../../utils/dialog.js')  // 引入

var app = getApp()
Page({
  data: {
    goodsList: {
      saveHidden: true,
      totalPrice: 0,
      allSelect: true,
      noSelect: false,
      list: [],
      selectNum: 0
    },
    shopDeliveryPrice:[],
    delBtnWidth: 120,    //删除按钮宽度单位（rpx）
    hasSku: false,
    sku: {}
  },

  /**
   * 获取元素自适应后的实际宽度
   */
  getEleWidth: function (w) {
    var real = 0;
    try {
      var res = wx.getSystemInfoSync().windowWidth;
      var scale = (750 / 2) / (w / 2);  //以宽度750px设计稿做宽度的自适应
      // console.log(scale);
      real = Math.floor(res / scale);
      return real;
    } catch (e) {
      return false;
      // Do something when catch error
    }
  },
  
  /**
   * 初始化滑动显示的删除按钮
   */
  initEleWidth: function () {
    var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
    this.setData({
      delBtnWidth: delBtnWidth
    });
  },
  onLoad: function () {
    this.setData({ 
      navHeight: app.globalData.navHeight
    })
    this.initEleWidth();
    //this.onShow();
    //this.getDeliveryPrice()
  },
  onShow: function () {
    var cartList = [];
    if (app.globalData.userInfo == null) {
      var url = '/pages/cart/cart'
      var query = {
        url: url,
        type: '',
        page: 'cart'
      }
      wx.navigateTo({
        url: '/pages/login/login?param=' + JSON.stringify(query),
      })
    } else {
      // 获取购物车数据
      var shopCarInfoMem = wx.getStorageSync('cartInfo');
      if (shopCarInfoMem && shopCarInfoMem.cartList) {
        cartList = shopCarInfoMem.cartList
      }
      this.data.goodsList.list = cartList;
      this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), cartList);
    }
  },

  /**
   * 去逛逛
   */
  toIndexPage: function () {
    wx.switchTab({
      url: "/pages/class/class"
    });
  },

  /**
   * 
   */
  touchS: function (e) {
    if (e.touches.length == 1) {
      this.setData({
        startX: e.touches[0].clientX
      });
    }
  },

  /**
   * 滑动
   */
  touchM: function (e) {
    var index = e.currentTarget.dataset.index;
    if (e.touches.length == 1) {
      var moveX = e.touches[0].clientX;
      var disX = this.data.startX - moveX;
      var delBtnWidth = this.data.delBtnWidth;
      var left = "";
      if (disX == 0 || disX < 10) {//如果移动距离小于等于0，container位置不变
        left = "margin-left:0px";
      } else if (disX > 10) {//移动距离大于0，container left值等于手指移动距离
        left = "margin-left:-" + disX + "px";
        if (disX >= delBtnWidth) {
          left = "left:-" + delBtnWidth + "px";
        }
      }
      var list = this.data.goodsList.list;
      if (index != "" && index != null) {
        list[parseInt(index)].left = left;
        this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
      }
    }
  },

  touchE: function (e) {
    var index = e.currentTarget.dataset.index;
    if (e.changedTouches.length == 1) {
      var endX = e.changedTouches[0].clientX;
      var disX = this.data.startX - endX;
      var delBtnWidth = this.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var left = disX > delBtnWidth ? "margin-left:-" + delBtnWidth + "px" : "margin-left:0px";
      var list = this.data.goodsList.list;
      if (index !== "" && index != null) {
        list[parseInt(index)].left = left;
        this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);

      }
    }
  },

  /**
   * 删除单个商品
   */
  delItem: function (e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.goodsList.list;
    list.splice(index, 1);
    this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
  },

  /**
   * 选中商品
   */
  selectTap: function (e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.goodsList.list;
    if (index !== "" && index != null) {
      list[parseInt(index)].active = !list[parseInt(index)].active;
      this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
    }
  },

  /**
   * 计算已选商品总价
   */
  totalPrice: function () {
    var list = this.data.goodsList.list;
    var total = 0;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      if (curItem.active) {
        total += parseFloat(curItem.price) * curItem.number;
      }
    }
    total = parseFloat(total.toFixed(2));//js浮点计算bug，取两位小数精度
    return total;
  },

  /**
   * 判断是否全选
   */
  allSelect: function () {
    var list = this.data.goodsList.list;
    var allSelect = false;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      if (curItem.active) {
        allSelect = true;
      } else {
        allSelect = false;
        break;
      }
    }
    return allSelect;
  },
  
  /**
   * 判断是否没有选中项
   */
  noSelect: function () {
    var list = this.data.goodsList.list;
    var noSelect = 0;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      if (!curItem.active) {
        noSelect++;
      }
    }
    if (noSelect == list.length) {
      return true;
    } else {
      return false;
    }
  },
  
  /**
   * 获取已选商品总数
   */
  getSelectNum: function () {
    var list = this.data.goodsList.list;
    var select = 0;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      if (curItem.active) {
        select += curItem.number
      }
    }
    
    return select;
  }, 

  /**
   * 设置商品列表
   */
  setGoodsList: function (saveHidden, total, allSelect, noSelect, list) {
    var selectNum = this.getSelectNum();
    this.setData({
      goodsList: {
        saveHidden: saveHidden,
        totalPrice: total,
        allSelect: allSelect,
        noSelect: noSelect,
        list: list,
        selectNum: selectNum
      }
    });
    var _cartInfo = {};
    var tempNumber = 0;
    _cartInfo.cartList = list;
    for (var i = 0; i < list.length; i++) {
      tempNumber = tempNumber + list[i].number
    }
    _cartInfo.cartNum = tempNumber;
    wx.setStorage({
      key: "cartInfo",
      data: _cartInfo
    })
  },
  
  /**
   * 全选按钮事件
   */
  bindAllSelect: function () {
    var currentAllSelect = this.data.goodsList.allSelect;
    var list = this.data.goodsList.list;
    if (currentAllSelect) {
      for (var i = 0; i < list.length; i++) {
        var curItem = list[i];
        curItem.active = false;
      }
    } else {
      for (var i = 0; i < list.length; i++) {
        var curItem = list[i];
        curItem.active = true;
      }
    }

    this.setGoodsList(this.getSaveHide(), this.totalPrice(), !currentAllSelect, this.noSelect(), list);
  },

  /**
   * 商品数量input框事件
   */
  setNumberInput: function (e) {
    console.log('setNumberInput-->', e)
    var that = this;
    var index = e.currentTarget.dataset.index;
    var list = that.data.goodsList.list;
    if (index !== "" && index != null) {
      // 添加判断当前商品购买数量是否超过当前商品可购买库存
      var cartBean = list[parseInt(index)];
      var stock = cartBean.skuStock;
      var num = cartBean.number;
      if (num < stock) {
        list[parseInt(index)].number++;
        that.setGoodsList(that.getSaveHide(), that.totalPrice(), that.allSelect(), that.noSelect(), list);
      } else {
        dialog.dialog('提示', e.currentTarget.dataset.name + ' 商品库存不足'+stock+'无法继续增加', false, '确定');
        list[parseInt(index)].number = stock;
        that.setGoodsList(that.getSaveHide(), that.totalPrice(), that.allSelect(), that.noSelect(), list);
        return;
      }

      that.setData({
        curTouchGoodStores: stock
      })
    }
  },

  /**
   * 加按钮事件
   */
  jiaBtnTap: function (e) {
    var that = this
    var index = e.currentTarget.dataset.index;
    var list = that.data.goodsList.list;
    if (index !== "" && index != null) {
      // 添加判断当前商品购买数量是否超过当前商品可购买库存
      var cartBean = list[parseInt(index)];
      console.log(cartBean);
      var stock = cartBean.skuStock;
      var num = cartBean.number;
      if (num < stock) {
        list[parseInt(index)].number++;
        that.setGoodsList(that.getSaveHide(), that.totalPrice(), that.allSelect(), that.noSelect(), list);
      } else {
        dialog.dialog('提示', e.currentTarget.dataset.name + ' 商品库存不足剩余'+stock+'无法继续增加', false, '确定');
        list[parseInt(index)].number = stock;
        that.setGoodsList(that.getSaveHide(), that.totalPrice(), that.allSelect(), that.noSelect(), list);
        return;
      }
      
      that.setData({
        curTouchGoodStores: stock
      })   

    }
  },

  /**
   * 减按钮事件
   */
  jianBtnTap: function (e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.goodsList.list;
    if (index !== "" && index != null) {
      if (list[parseInt(index)].number > 1) {
        list[parseInt(index)].number--;
        this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
      }
    }
  },

  /**
   * 编辑按钮事件
   */
  editTap: function () {
    var list = this.data.goodsList.list;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      curItem.active = false;
    }
    this.setGoodsList(!this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
  },

  /**
   * 完成按钮事件
   */
  saveTap: function () {
    var list = this.data.goodsList.list;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      curItem.active = true;
    }
    this.setGoodsList(!this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
  },

  /**
   * 获取完成按钮隐藏属性
   */
  getSaveHide: function () {
    var saveHidden = this.data.goodsList.saveHidden;
    return saveHidden;
  },

  /**
   * 删除已选项
   */
  deleteSelected: function () {
    var list = this.data.goodsList.list;
    list = list.filter(function (curGoods) {
      return !curGoods.active;
    });
    this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
  },

  /**
   * 去结算
   */
  toPayOrder: function () {
    //dialog.dialog('提示', '获取商品异常，请联系管理员!', false, '');
    wx.showLoading();
    var that = this;
    if (this.data.goodsList.noSelect) {
      wx.hideLoading();
      return;
    }
    // 重新计算价格，判断库存
    var cartList = [];
    var shopCarInfoMem = wx.getStorageSync('cartInfo');
    if (shopCarInfoMem && shopCarInfoMem.cartList) {
      cartList = shopCarInfoMem.cartList.filter(entity => {
        return entity.active;
      });
    }
    if (cartList.length == 0) {
      wx.hideLoading();
      return;
    }
    var isFail = false;
    var doneNumber = 0;
    var needDoneNUmber = cartList.length;
    for (let i = 0; i < cartList.length; i++) {
      if (isFail) {
        wx.hideLoading();
        return;
      }
      let cartBean = cartList[i];
      // 获取价格和库存
      if (!cartBean.specValue || cartBean.specValue == "") {
        var param = {
          id: cartBean.goodsId
        }
        http('/goods/getGoodsInfo/' + cartBean.goodsId, null, null, 'POST').then(res => {
          if (res.success) {
            doneNumber++;
            if (res.data.obj.status == 'SW1402') {
              dialog.dialog('提示', res.data.obj.goodsName + ' 商品已下架，请重新购买', false, '确定');
              isFail = true;
              wx.hideLoading();
              return;
            } 
            if (res.data.obj.status == 'SW1301') {
              dialog.dialog('提示', res.data.obj.goodsName + ' 商品已失效，请重新购买', false, '确定');
              isFail = true;
              wx.hideLoading();
              return;
            }
            if (res.data.obj.stock < cartBean.number) {
              dialog.dialog('提示', res.data.obj.goodsName + ' 商品库存不足，请重新购买', false, '确定');
              isFail = true;
              wx.hideLoading();
              return;
            }
            if (needDoneNUmber == doneNumber) {
              that.navigateToPayOrder();
            }
          } else {
            dialog.dialog('提示', '获取商品异常，请联系管理员!', false, '确定');
          }
        })
      } else {
        http('/goods/getGoodsInfo/' + cartBean.goodsId, null, null, 'POST').then(res => {
          if (res.success) {
            doneNumber++;
            that.getSku(res.data.obj.skuStockList, cartBean.specValue)
            if (!that.data.hasSku) {
              dialog.dialog('提示', res.data.obj.goodsName + ' 商品不存在，请重新购买', false, '确定');
              isFail = true;
              wx.hideLoading();
              return;
            }
            if (that.data.sku.skuStock < cartBean.number) {
              dialog.dialog('提示', res.data.obj.goodsName + ' 商品库存不足，请重新购买', false, '确定');
              isFail = true;
              wx.hideLoading();
              return;
            }
            if (that.data.sku.skuPrice != cartBean.price) {
              dialog.dialog('提示', res.data.obj.goodsName + ' 商品价格有调整，请重新购买', false, '确定');
              isFail = true;
              wx.hideLoading();
              return;
            }
            if (needDoneNUmber == doneNumber) {
              that.navigateToPayOrder();
            }
          } else {
            dialog.dialog('提示', '获取商品异常，请联系管理员!', false, '确定');
          }
        })
        
      }

    }
  },
  
  /**
   * 获取SKU
   */
  getSku: function(list, value) {
    let skuList = list
    for (let i = 0; i < skuList.length; i++) {
      if (value == skuList[i].specValue) {
        this.setData({
          sku: skuList[i],
          hasSku: true
        });
      }
    }
  },

  /**
   * 跳转到结算页面
   */
  navigateToPayOrder: function () {
    wx.hideLoading();
    wx.navigateTo({
      url: "/pages/order-pay/orderPay?orderType=cart"
    })
  },

  /**
   * 获取配送价格
   */
  getDeliveryPrice:function() {
    var that = this
    //  获取关于我们Title
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/config/get-value',
      data: {
        key: 'shopDeliveryPrice'
      },
      success: function (res) {
        if (res.data.code == 0) {
          var shopDeliveryPrice = parseFloat(parseFloat(res.data.data.value).toFixed(2))
          that.setData({
            shopDeliveryPrice: shopDeliveryPrice
          })
          console.log('配送起步价：',shopDeliveryPrice,res.data.data.value)
        }
      }
    })
  }
})
