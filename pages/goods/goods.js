var app = getApp();
var WxParse = require('../../lib/wxParse/wxParse.js');
const http = require('../../utils/http.js')  // 引入
const dialog = require('../../utils/dialog.js')  // 引入

Page({
  data: {
    winHeight: "",
    id: 0,
    goods: {},
    gallery: [],
    comment: [],
    brand: {},
    specsList:[],
    relatedGoods: [],
    userHasCollect: 0,
    buyNumber: 0,
    buyNumMin: 1,
    buyNumMax: 0,
    selectSpecOption: [],
    specValue: '',
    skuPrice: 0,
    skuStockList: [], 
    cartInfo: {},
    cartNum: 0,
    sku: {},
    hasSku: false,
    checkedSpecText: '请选择规格数量',
    showAttr: false,
    noCollectImage: "/pages/images/icon_collect.png",
    hasCollectImage: "/pages/images/icon_collect_checked2.png",
    collectBackImage: "/pages/images/icon_collect.png" // 可删
  },
  onShareAppMessage: function () {
    let that = this;
    return {
      title: that.data.goods.name,
      desc: 'SNU CHIC',
      path: '/pages/goods/goods?id=' + that.data.goods.id
    }
  },

  getGoodsInfo: function () {
    let that = this;
    http('/wx/goods/getGoodsInfo/'+that.data.id, null, null, 'post').then(res => {
      if(res.success){
        that.setData({
          goods: res.data.obj,
          brand: res.data.obj.brand,
          gallery: res.data.obj.fileList,
          specsList: res.data.obj.specsList,
          skuStockList: res.data.obj.skuStockList
        });
        this.getSelectSpec(res.data.obj.specsList);
        this.setSkuPrice(that.data.specValue)
        // if (res.data.userHasCollect == 1) {
        //   that.setData({
        //     'collectBackImage': that.data.hasCollectImage
        //   });
        // } else {
        //   that.setData({
        //     'collectBackImage': that.data.noCollectImage
        //   });
        // }

        WxParse.wxParse('goodsDetail', 'html', res.data.obj.goodsDesc == null ? '':res.data.obj.goodsDesc, that);

        //that.getGoodsRelated();
      }
    })

  },
  /**
   * 获取已选规格信息
   */
  getSelectSpec: function (list) {
    let _selectSpecOption = []
    let specValue=""
    if (list.length > 0) {
      for (let i = 0; i < list.length; i++) {
        let optionList = list[i].specOptionList;
        for (let j = 0; j < optionList.length; j++) {
          if (optionList[j].active) {
            _selectSpecOption.push(' ' + optionList[j].name)
            specValue += '[' + optionList[j].id + ',' + optionList[j].name + '];'
          }
        }
      }
      specValue = specValue.substring(0, specValue.length - 1)
      this.setData({
        selectSpecOption: _selectSpecOption,
        specValue: specValue
      });
    }
  },
  /**
   * 获取已选规格SKU价格
   */
  setSkuPrice: function(value){
    console.log(value)
    console.log(this.data.skuStockList)
    let skuList = this.data.skuStockList
    for (let i = 0; i < skuList.length; i++) {
      if (value == skuList[i].specValue) {
        this.setData({
          skuPrice: skuList[i].skuPrice,
          sku: skuList[i],
          buyNumMax: skuList[i].skuStock,
          buyNumber: (skuList[i].skuStock > 0) ? 1 : 0
        });
        if (skuList[i].skuStock > 0) {
          this.setData({
            hasSku: true,
          })
        } else {
          this.setData({
            hasSku: false,
          })
        }
      }
    }
  },

  getGoodsRelated: function () {
    let that = this;
    util.request(api.GoodsRelated, { id: that.data.id }).then(function (res) {
      if (res.errno === 0) {
        that.setData({
          relatedGoods: res.data.goodsList,
        });
      }
    });

  },
  clickSpecValue: function (event) {
    let that = this;
    let _index = event.currentTarget.dataset.propertychildindex;
    let _id = event.currentTarget.dataset.propertychildid;
    let _name = event.currentTarget.dataset.propertychildname;
    let _pName = event.currentTarget.dataset.propertyname;
    let pid = event.currentTarget.dataset.propertyid;
    //TODO 性能优化，可在wx:for中添加index，可以直接获取点击的属性名和属性值，不用循环
    let _specList = this.data.specsList;
    for (let i = 0; i < _specList.length; i++) {
      if (_specList[i].specName == _pName) {
        let _specOptionList = _specList[i].specOptionList;
        for (let j = 0; j < _specOptionList.length; j++) {
          if (_specOptionList[j].id == _id){
            _specOptionList[j].active = true
          } else {
            _specOptionList[j].active = false
          }
        }
      }
    }
    // 重新赋值
    this.setData({
      specsList: _specList
    });
    // 设置已选规格
    this.getSelectSpec(_specList)
    this.setSkuPrice(that.data.specValue)
    // //重新计算spec改变后的信息

  },

  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      navHeight: app.globalData.navHeight,
      id: options.id
    });
    var that = this;
    // 获取购物车数据
    wx.getStorage({
      key: 'cartInfo',
      success: function (res) {
        that.setData({
          cartInfo: res.data,
          cartNum: res.data.cartNum
        });
      }
    })
    this.getGoodsInfo();
    // 记录商品浏览痕迹
    this.saveFootprint();
    var that = this
    //  高度自适应
    wx.getSystemInfo({
      success: function (res) {
        let model = res.model;
        console.log(model)
        if (model.search('iPhone X') != -1) {
          app.globalData.isIphoneX = true
        } else {

        }
        if (/iphone\sx/i.test(model)
          || (/iphone/i.test(model) && /unknown/.test(model))
          || /iphone\s11/.test(model)) {
          app.globalData.isIphoneX = true;
        } else {
          app.globalData.isIphoneX = false;
        }
        var clientHeight = res.windowHeight,
        clientWidth = res.windowWidth,
        rpxR = 750 / clientWidth;
        var calc = clientHeight * rpxR - 100;
        console.log(calc)
        that.setData({
          winHeight: calc
        });
      }
    });

    let isIphoneX = app.globalData.isIphoneX;
    this.setData({
      isIphoneX: isIphoneX
    });

  },
  onReady: function () {
    // 页面渲染完成

  },
  onShow: function () {
    // 页面显示

  },
  onHide: function () {
    // 页面隐藏

  },
  onUnload: function () {
    // 页面关闭

  },
  /**
   * 商品浏览记录
   */
  saveFootprint: function() {
    let that = this;
    if (!app.globalData.hasLogin) {
      return;
    }
    var param = {
      customerId: app.globalData.userInfo.id,
      goodsId: that.data.id,
      type: '商品'
    }
    http('/footprint/saveFootprint', param, null, 'post').then(res => {
      if (!res.success) {
        console.log('浏览记录失败')
      }
    })
  },
  /**
   * 规格选择弹出框隐藏
   */
  closePopupTap: function () {
    this.setData({
      showAttr: false
    })
  },
  numJianTap: function () {
    if (this.data.buyNumber > this.data.buyNumMin) {
      var currentNum = this.data.buyNumber;
      currentNum--;
      this.setData({
        buyNumber: currentNum
      })
    }
  },
  numJiaTap: function () {
    if (this.data.buyNumber < this.data.buyNumMax) {
      var currentNum = this.data.buyNumber;
      currentNum++;
      this.setData({
        buyNumber: currentNum
      })
    }
  },
  switchAttrPop: function () {
    if (this.data.showAttr == false) {
      this.setData({
        showAttr: !this.data.showAttr
      });
    }
  },
  closeAttrOrCollect: function () {
    let that = this;
    if (this.data.showAttr) {
      this.setData({
        showAttr: false,
      });
      if (that.data.userHasCollect == 1) {
        that.setData({
          'collectBackImage': that.data.hasCollectImage
        });
      } else {
        that.setData({
          'collectBackImage': that.data.noCollectImage
        });
      }
    } else {
      //添加或是取消收藏
      util.request(api.CollectAddOrDelete, { typeId: 0, valueId: this.data.id }, "POST")
        .then(function (res) {
          let _res = res;
          if (_res.errno == 0) {
            if ( _res.data.type == 'add') {
              that.setData({
                'collectBackImage': that.data.hasCollectImage
              });
            } else {
              that.setData({
                'collectBackImage': that.data.noCollectImage
              });
            }

          } else {
            wx.showToast({
              image: '/static/images/icon_error.png',
              title: _res.errmsg,
              mask: true
            });
          }

        });
    }

  },
  openCartPage: function () {
    wx.switchTab({
      url: '/pages/cart/cart',
    });
  },

  /**
   * 直接购买
   */
  buyGoods: function () {
    var that = this;
    if (app.globalData.hashLogin) {
      var url = '/pages/goods/goods'
      var query = {
        url: url,
        type: that.data.id,
        page: 'goods',
      }
      wx.navigateTo({
        url: '/pages/login/login?param=' + JSON.stringify(query),
      })
    } else {
      if (this.data.showAttr == false) {
        //打开规格选择窗口
        this.setData({
          showAttr: !this.data.showAttr,
        });
      } else {
  
        //根据选中的规格，判断是否有对应的sku信息
        if (!that.data.hasSku) {
          //找不到对应的product信息，提示没有库存
          dialog.showToast('没有库存!', null, '/pages/images/icon_error.png', 2000)
          return false;
        }
        console.log(that.data.sku)
        //验证库存
        if (that.data.sku.skuStock < this.data.number) {
          //找不到对应的product信息，提示没有库存
          dialog.showToast('没有库存!', null, '/pages/images/icon_error.png', 2000)
          return false;
        }
  
        //组建立即购买信息
        var buyNowInfo = this.buliduBuyNowInfo();
        // 写入本地存储
        wx.setStorage({
          key: "buyNowInfo",
          data: buyNowInfo
        })
        this.closePopupTap();
  
        wx.navigateTo({
          url: "/pages/order-pay/orderPay?orderType=buyNow"
        })
    }
    
    }
  },

  /**
   * 添加到购物车
   */
  addToCart: function () {
    var that = this;
    if (app.globalData.hashLogin) {
      var url = '/pages/goods/goods'
      var query = {
        url: url,
        type: that.data.id,
        page: 'goods',
      }
      wx.navigateTo({
        url: '/pages/login/login?param=' + JSON.stringify(query),
      })
    } else {
      if (this.data.showAttr == false) {
        //打开规格选择窗口
        this.setData({
          showAttr: !this.data.showAttr
        });
      } else {

        //提示选择完整规格
        // if (!this.isCheckedAllSpec()) {
        //   return false;
        // }
        //根据选中的规格，判断是否有对应的sku信息
        if (!that.data.hasSku) {
          //找不到对应的product信息，提示没有库存
          dialog.showToast('没有库存!', null, '/pages/images/icon_error.png', 2000)
          return false;
        }
        console.log(that.data.sku)
        //验证库存
        if (that.data.sku.skuStock < this.data.number) {
          //找不到对应的product信息，提示没有库存
          dialog.showToast('没有库存!', null, '/pages/images/icon_error.png', 2000)
          return false;
        }

        var _cartInfo = this.bulidShopCarInfo()
        console.log(that.data.cartInfo)
        this.setData({
          cartInfo: _cartInfo,
          cartNum: _cartInfo.cartNum
        });

        // 写入本地存储
        wx.setStorage({
          key: "cartInfo",
          data: _cartInfo
        })
        this.closePopupTap();
        dialog.showToast('添加成功!', null, '', 2000)
      }
    }
  },

  /**
   * 组建购物车信息
   */
  bulidShopCarInfo: function () {
    // 加入购物车
    var shopCarMap = {};
    shopCarMap.goodsId = this.data.goods.id;
    shopCarMap.pic = this.data.goods.fileUrl;
    shopCarMap.label = this.data.goods.goodsBrief;
    shopCarMap.name = this.data.goods.goodsName;
    shopCarMap.brandName = this.data.goods.brand.brandName;
    shopCarMap.categoryId = this.data.goods.categoryId;
    shopCarMap.giftGrowth = this.data.goods.giftGrowth;
    shopCarMap.goodsIntegral = this.data.goods.goodsIntegral;
    // shopCarMap.label=this.data.goodsDetail.basicInfo.id; 规格尺寸 
    shopCarMap.selectSpecOption = this.data.selectSpecOption;
    shopCarMap.specValue = this.data.specValue;
    //shopCarMap.label = this.data.propertyChildNames;
    shopCarMap.price = this.data.skuPrice;
    shopCarMap.left = "";
    shopCarMap.active = true;
    shopCarMap.number = this.data.buyNumber;
    shopCarMap.skuId = this.data.sku.id;
    shopCarMap.skuPic = this.data.sku.picUrl;
    shopCarMap.skuStock = this.data.sku.skuStock;
    shopCarMap.skuCode = this.data.sku.skuCode;
    
    //shopCarMap.logisticsType = this.data.goodsDetail.basicInfo.logisticsId;
    shopCarMap.logistics = true;
    //shopCarMap.weight = this.data.goodsDetail.basicInfo.weight;

    var cartInfo = this.data.cartInfo;
    if (!cartInfo.cartNum) {
      cartInfo.cartNum = 0;
    }
    if (!cartInfo.cartList) {
      cartInfo.cartList = [];
    }
    var hasSameGoodsIndex = -1;
    for (var i = 0; i < cartInfo.cartList.length; i++) {
      var tmpShopCarMap = cartInfo.cartList[i];
      if (tmpShopCarMap.goodsId == shopCarMap.goodsId && tmpShopCarMap.skuId == shopCarMap.skuId) {
        hasSameGoodsIndex = i;
        shopCarMap.number = shopCarMap.number + tmpShopCarMap.number;
        break;
      }
    }

    cartInfo.cartNum = cartInfo.cartNum + this.data.buyNumber;
    if (hasSameGoodsIndex > -1) {
      cartInfo.cartList.splice(hasSameGoodsIndex, 1, shopCarMap);
    } else {
      cartInfo.cartList.push(shopCarMap);
    }
    
    return cartInfo;
  },

  /**
	 * 组建立即购买信息
	 */
  buliduBuyNowInfo: function () {
    var shopCarMap = {};
    shopCarMap.goodsId = this.data.goods.id;
    shopCarMap.pic = this.data.goods.fileUrl;
    shopCarMap.label = this.data.goods.goodsBrief;
    shopCarMap.name = this.data.goods.goodsName;
    shopCarMap.brandName = this.data.goods.brand.brandName;
    shopCarMap.categoryId = this.data.goods.categoryId;
    shopCarMap.giftGrowth = this.data.goods.giftGrowth;
    shopCarMap.goodsIntegral = this.data.goods.goodsIntegral;
    // shopCarMap.label=this.data.goodsDetail.basicInfo.id; 规格尺寸 
    shopCarMap.selectSpecOption = this.data.selectSpecOption;
    shopCarMap.specValue = this.data.specValue;
    //shopCarMap.label = this.data.propertyChildNames;
    shopCarMap.price = this.data.skuPrice;
    shopCarMap.left = "";
    shopCarMap.active = true;
    shopCarMap.number = this.data.buyNumber;
    shopCarMap.skuId = this.data.sku.id;
    shopCarMap.skuPic = this.data.sku.picUrl;
    shopCarMap.skuStock = this.data.sku.skuStock;
    shopCarMap.skuCode = this.data.sku.skuCode;

    // shopCarMap.logisticsType = this.data.goodsDetail.basicInfo.logisticsId;
    shopCarMap.logistics = true;
    // shopCarMap.weight = this.data.goodsDetail.basicInfo.weight;

    var buyNowInfo = {};
    if (!buyNowInfo.cartNum) {
      buyNowInfo.cartNum = 0;
    }
    if (!buyNowInfo.cartList) {
      buyNowInfo.cartList = [];
    }

    buyNowInfo.cartList.push(shopCarMap);
    //buyNowInfo.kjId = this.data.kjId;
    return buyNowInfo;
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
  }
})