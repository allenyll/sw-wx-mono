const http = require('../../../../utils/http.js')  // 引入
const dialog = require('../../../../utils/dialog.js')  // 引入
var app = getApp()

Page({
  data: {
    id: '', // 用户ID
    currentMessageType: 'all', // income:收入 / outcome:支出
    navFixed: false, // 固定导航条
    /*
      xxxBranch 对象
      data: 对应分支的数据
      isMore: 是否拥有更多的新的数据
      currentPage: 当前已经加载到页数
      onload: 是否处在数据加载中， true加载中，false加载完毕
    */
    allBranch: {
      data: [
      ],
      isMore: 0,
      currentPage: 1,
      onload: false
    },
    incomeBranch: {
      data: [
      ],
      isMore: 0,
      currentPage: 1,
      onload: false
    },
    outcomeBranch: {
      data: [],
      isMore: 0,
      currentPage: 1,
      onload: false
    },
  },
  onLoad: function (options) {
    console.log(unescape(options.id))
    this.setData({
      navHeight: app.globalData.navHeight,
      id: unescape(options.id)
    })
    this.getBalanceDetail('all');
    this.getBalanceDetail('income');
    this.getBalanceDetail('outcome');
    //this.getIntegralRuleData();
    //this.getPointDetail('income');
    //this.getPointDetail('income');
  },

  // 获取对应消息数据
  getBalanceDetail: function (type, page) {
    let that = this;
    let action = '';
    if(type == 'all'){
      action = 'SW0500'
    } else if (type == 'income') {
      action = 'SW0501';
    } else if (type = 'outcome') {
      action = 'SW0502';
    }
    var param = {
      'customerId': app.globalData.userInfo.id,
      'action': action,
      'page': page || 1
    }
    http('/customerBalanceDetail/getBalanceDetail', param, '', 'post').then(res => {
      switch (type) {
        // 全部
        case 'all':
          that.setData({
            'allBranch.data': that.data.allBranch.data ? that.data.allBranch.data.concat(that.parseMessageData(res.data.list, type)) : that.parseMessageData(res.data.list, type),
            'allBranch.isMore': res.data.is_more,
            'allBranch.currentPage': res.data.current_page,
            'allBranch.onload': false,
          });
          break;
        // 收入消息
        case 'income':
          that.setData({
            'incomeBranch.data': that.data.incomeBranch.data ? that.data.incomeBranch.data.concat(that.parseMessageData(res.data.list, type)) : that.parseMessageData(res.data.list, type),
            'incomeBranch.isMore': res.data.is_more,
            'incomeBranch.currentPage': res.data.current_page,
            'incomeBranch.onload': false,
          });
          break;
        // 支出消息
        case 'outcome':
          that.setData({
            'outcomeBranch.data': that.data.outcomeBranch.data ? that.data.outcomeBranch.data.concat(that.parseMessageData(res.data.list, type)) : that.parseMessageData(res.data.list, type),
            'outcomeBranch.isMore': res.data.is_more,
            'outcomeBranch.currentPage': res.data.current_page,
            'outcomeBranch.onload': false,
          })
          break;
      }
    })
  },
  // 解析对应消息数据
  parseMessageData: function (data, type) {
    var that = this;
    let array = [];
    let item = {};
    data = data.records;
    for (var i = 0; i < data.length; i++) {
      item = {
        content: data[i].remark,
        num: data[i].balance,
        time: data[i].time,
        year: data[i].time.substring(0,4),
        date: data[i].time.substring(5,10),
        type: data[i].type
      }
      array.push(item);
    }
    return array;
  },
  // 底部触发是否获取数据
  checkMoreMessageData: function () {
    let that = this;
    switch (that.data.currentMessageType) {
      case 'all':
        // 有更多数据 并且 不在加载中时 执行
        if ((that.data.allBranch.isMore != 0) && (!that.data.allBranch.onload)) {
          that.getBalanceDetail('income', (that.data.allBranch.currentPage + 1));
          that.setData({
            'allBranch.onload': true
          });
        }
        break;
      case 'income':
        // 有更多数据 并且 不在加载中时 执行
        if ((that.data.incomeBranch.isMore != 0) && (!that.data.incomeBranch.onload)) {
          that.getBalanceDetail('income', (that.data.incomeBranch.currentPage + 1));
          that.setData({
            'incomeBranch.onload': true
          });
        }
        break;
      case 'outcome':
        // 有更多数据 并且 不在加载中时 执行
        if ((that.data.outcomeBranch.isMore != 0) && (!that.data.outcomeBranch.onload)) {
          that.getBalanceDetail('outcome', (that.data.outcomeBranch.currentPage + 1));
          that.setData({
            'outcomeBranch.onload': true
          });
        }
        break;
    }
  },
  // 固定消息导航条
  fixedMessageNav: function (event) {
    var that = this;
    if (event.detail.scrollTop <= 135) {
      that.setData({
        // navStyle: ''
        navFixed: false
      });
    } else {
      that.setData({
        // navStyle: 'position: fixed; top: 0; left: 0;'
        navFixed: true
      });
    }
  },
  // 切换显示的消息类型
  setCurrentMessageType: function (event) {
    this.setData({
      'currentMessageType': event.target.dataset.type
    });
  },
  // 积分规则：打开积分详情
  showIntegralRule: function () {
    // 设置页面标题
    app.setPageTitle('积分规则');
    // 请求数据
    this.setData({
      'integralPage': 1
    });
  },
  // 积分规则：关闭积分详情(返回:个人积分主页)
  hideIntegralRule: function () {
    // 设置页面标题
    app.setPageTitle('个人积分');
    // 回到系统通知页面,清空表单数据
    this.setData({
      'integralPage': 0
    });
  }
})
