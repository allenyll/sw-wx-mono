// components/navbar/index.js
const app = getApp();

Component({
  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {
    showBack: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    showPop: false
  },
  lifetimes: {
    attached: function () {
      
     }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //回退
    gotop:function(e){
      if (wx.pageScrollTo) {
        wx.pageScrollTo({
          scrollTop: 0
        })
        // 隐藏按钮
        this.triggerEvent('showBack', {})
      } else {
        wx.showModal({
          title: '提示',
          content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
        })
      }
    }
  }
})