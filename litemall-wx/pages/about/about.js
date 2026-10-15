const util = require('../../utils/util.js');
const api = require('../../config/api.js');

//获取应用实例
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '蒙关牧',
    desc: '位置于内蒙古呼伦贝尔市新巴尔虎右旗阿日哈沙特镇口岸边境牧场，纯天然散养牛羊。',
    picUrl: '',
    address: 'https://github.com/linlinjava/litemall',
    latitude: '31.201900',
    longitude: '121.587839',
    phone: '021-xxxx-xxxx',
    qq: '705144434'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getAbout();
    this.getBrandInfo();
  },
  getAbout: function () {
    let that = this;
    util.request(api.AboutUrl).then(function (res) {
      if (res.errno === 0) {
        that.setData({
          name: res.data.name,
          address: res.data.address,
          phone: res.data.phone,
          qq: res.data.qq,
          latitude: res.data.latitude,
          longitude: res.data.longitude
        });
      }
    });
  },
  getBrandInfo: function () {
    let that = this;
    util.request(api.BrandDetail, {
      id: 1046003
    }).then(function (res) {
      if (res.errno === 0 && res.data && res.data.id) {
        that.setData({
          desc: res.data.desc || that.data.desc,
          picUrl: res.data.picUrl || ''
        });
      } else {
        that.findBrandFromList();
      }
    }).catch(function () {
      that.findBrandFromList();
    });
  },
  findBrandFromList: function () {
    let that = this;
    util.request(api.BrandList, {
      page: 1,
      limit: 50
    }).then(function (res) {
      if (res.errno === 0 && res.data && Array.isArray(res.data.list)) {
        let targetName = that.data.name || '蒙关牧';
        let matched = res.data.list.find(function (item) {
          return item.name === targetName || item.name === '蒙关牧';
        }) || res.data.list[0];
        if (matched) {
          that.setData({
            desc: matched.desc || that.data.desc,
            picUrl: matched.picUrl || ''
          });
        }
      }
    });
  },
  showLocation: function (e) {
    var that = this;
    var lat = parseFloat(that.data.latitude);
    var lng = parseFloat(that.data.longitude);
    if (isNaN(lat) || isNaN(lng)) {
      wx.showToast({
        title: '暂未配置地图坐标',
        icon: 'none'
      });
      return;
    }
    wx.openLocation({
      latitude: lat,
      longitude: lng,
      name: that.data.name,
      address: that.data.address,
    })
  },
  callPhone: function (e) {
    var that = this
    wx.makePhoneCall({
      phoneNumber: that.data.phone,
    })
  },
  copyQQ: function() {
    var qq = this.data.qq;
    if (!qq) {
      return;
    }
    wx.setClipboardData({
      data: String(qq),
      success: function() {
        wx.hideToast();
        wx.showToast({
          title: '已复制',
          icon: 'none'
        });
      }
    });
  }
})