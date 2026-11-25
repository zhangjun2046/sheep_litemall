var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var check = require('../../../utils/check.js');
var app = getApp();

Page({
  data: {
    addressList: [],
    total: 0
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady: function() {
    // 页面渲染完成
  },
  onShow: function() {
    // 页面显示
    this.getAddressList();
  },
  getAddressList() {
    let that = this;
    util.request(api.AddressList).then(function(res) {
      if (res.errno === 0) {
        that.setData({
          addressList: res.data.list,
          total: res.data.total
        });
      }
    });
  },
  addressAddOrUpdate(event) {
    console.log(event)

    //返回之前，先取出上一页对象，并设置addressId
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];

    if (prevPage.route == "pages/checkout/checkout") {
      try {
        wx.setStorageSync('addressId', event.currentTarget.dataset.addressId);
      } catch (e) {

      }

      let addressId = event.currentTarget.dataset.addressId;
      if (addressId && addressId != 0) {
        wx.navigateBack();
      } else {
        wx.navigateTo({
          url: '/pages/ucenter/addressAdd/addressAdd?id=' + addressId
        })
      }

    } else {
      wx.navigateTo({
        url: '/pages/ucenter/addressAdd/addressAdd?id=' + event.currentTarget.dataset.addressId
      })
    }
  },
  importWechatAddress() {
    let that = this;
    wx.chooseAddress({
      success: function(res) {
        that.saveWechatAddress(res);
      },
      fail: function(err) {
        let message = (err && err.errMsg) || '';
        if (message.indexOf('cancel') >= 0) {
          return;
        }
        wx.showModal({
          title: '无法使用微信地址',
          content: message || '未知错误',
          showCancel: false
        });
      }
    });
  },
  saveWechatAddress(res) {
    let that = this;
    let draft = {
      name: res.userName || '',
      tel: res.telNumber || '',
      province: res.provinceName || '',
      city: res.cityName || '',
      county: res.countyName || '',
      addressDetail: res.detailInfoNew || res.detailInfo || '',
      isDefault: that.data.addressList.length === 0
    };
    let phoneOk = check.isValidPhone(draft.tel);
    let areaCode = parseInt(res.nationalCode, 10);
    if (!phoneOk || !areaCode) {
      that.openWechatDraft(draft, !phoneOk);
      return;
    }
    util.request(api.RegionChain, {
      code: areaCode
    }).then(function(chainRes) {
      let chain = chainRes && chainRes.errno === 0 ? chainRes.data : null;
      if (!chain || !chain.province || !chain.city || !chain.county) {
        that.openWechatDraft(draft, false);
        return;
      }
      util.request(api.AddressSave, {
        id: 0,
        name: draft.name,
        tel: draft.tel,
        province: chain.province.name,
        city: chain.city.name,
        county: chain.county.name,
        areaCode: chain.county.code,
        addressDetail: draft.addressDetail,
        isDefault: draft.isDefault
      }, 'POST').then(function(saveRes) {
        if (saveRes.errno !== 0) {
          util.showErrorToast(saveRes.errmsg || '保存失败');
          return;
        }
        let pages = getCurrentPages();
        let prevPage = pages.length > 1 ? pages[pages.length - 2] : null;
        if (prevPage && prevPage.route == 'pages/checkout/checkout') {
          try {
            wx.setStorageSync('addressId', saveRes.data);
          } catch (e) {}
          prevPage.setData({
            addressId: saveRes.data
          });
          wx.navigateBack();
          return;
        }
        wx.showToast({
          title: '已导入',
          icon: 'success'
        });
        that.getAddressList();
      }).catch(function() {
        util.showErrorToast('保存失败');
      });
    }).catch(function() {
      that.openWechatDraft(draft, false);
    });
  },
  openWechatDraft(draft, phoneInvalid) {
    draft.notice = phoneInvalid ? '请改手机号' : '请选省市区';
    try {
      wx.setStorageSync('wxAddressDraft', draft);
    } catch (e) {}
    wx.navigateTo({
      url: '/pages/ucenter/addressAdd/addressAdd?id=0&from=wechat'
    });
  },
  deleteAddress(event) {
    console.log(event.target)
    let that = this;
    wx.showModal({
      title: '',
      content: '确定要删除地址？',
      success: function(res) {
        if (res.confirm) {
          let addressId = event.target.dataset.addressId;
          util.request(api.AddressDelete, {
            id: addressId
          }, 'POST').then(function(res) {
            if (res.errno === 0) {
              that.getAddressList();
              wx.removeStorage({
                key: 'addressId',
                success: function(res) {},
              })
            }
          });
          console.log('用户点击确定')
        }
      }
    })
    return false;

  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  }
})