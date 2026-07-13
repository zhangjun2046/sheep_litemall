var util = require('../../utils/util.js');
var api = require('../../config/api.js');

var app = getApp();

/**
 * 将本地缓存中的 ID 规范为数字；空串 / undefined / null / NaN 统一为 0
 */
function normalizeId(value) {
  if (value === '' || value === undefined || value === null) {
    return 0;
  }
  var num = Number(value);
  return isNaN(num) ? 0 : num;
}

Page({
  data: {
    checkedGoodsList: [],
    checkedAddress: {},
    availableCouponLength: 0, // 可用的优惠券数量
    goodsTotalPrice: 0.00, //商品总价
    freightPrice: 0.00, //快递费
    couponPrice: 0.00, //优惠券的价格
    grouponPrice: 0.00, //团购优惠价格
    orderTotalPrice: 0.00, //订单总价
    actualPrice: 0.00, //实际需要支付的总价
    cartId: 0,
    addressId: 0,
    couponId: 0,
    userCouponId: 0,
    message: '',
    grouponLinkId: 0, //参与的团购
    grouponRulesId: 0 //团购规则ID
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
  },

  //获取checkout信息；params 可选，避免依赖 setData 后的 this.data
  getCheckoutInfo: function(params, allowRetry) {
    let that = this;
    if (allowRetry === undefined) {
      allowRetry = true;
    }
    var cartId = params && params.cartId != null ? params.cartId : that.data.cartId;
    var addressId = params && params.addressId != null ? params.addressId : that.data.addressId;
    var couponId = params && params.couponId != null ? params.couponId : that.data.couponId;
    var userCouponId = params && params.userCouponId != null ? params.userCouponId : that.data.userCouponId;
    var grouponRulesId = params && params.grouponRulesId != null ? params.grouponRulesId : that.data.grouponRulesId;

    util.request(api.CartCheckout, {
      cartId: cartId,
      addressId: addressId,
      couponId: couponId,
      userCouponId: userCouponId,
      grouponRulesId: grouponRulesId
    }).then(function(res) {
      if (res.errno === 0) {
        that.setData({
          checkedGoodsList: res.data.checkedGoodsList,
          checkedAddress: res.data.checkedAddress,
          availableCouponLength: res.data.availableCouponLength,
          actualPrice: res.data.actualPrice,
          couponPrice: res.data.couponPrice,
          grouponPrice: res.data.grouponPrice,
          freightPrice: res.data.freightPrice,
          goodsTotalPrice: res.data.goodsTotalPrice,
          orderTotalPrice: res.data.orderTotalPrice,
          addressId: res.data.addressId,
          couponId: res.data.couponId,
          userCouponId: res.data.userCouponId,
          grouponRulesId: res.data.grouponRulesId,
        });
        // 与后端解析出的地址对齐，便于再次进入结算页
        try {
          wx.setStorageSync('addressId', normalizeId(res.data.addressId));
        } catch (e) {}
        wx.hideLoading();
        return;
      }

      // 立即购买残留的失效 cartId：清空后回退到购物车勾选商品再试一次
      if (allowRetry && cartId > 0) {
        try {
          wx.setStorageSync('cartId', 0);
        } catch (e) {}
        that.setData({
          cartId: 0
        });
        var retryParams = {
          cartId: 0,
          addressId: addressId,
          couponId: couponId,
          userCouponId: userCouponId,
          grouponRulesId: grouponRulesId
        };
        that.getCheckoutInfo(retryParams, false);
        return;
      }

      util.showErrorToast(res.errmsg || '结算信息获取失败');
      wx.hideLoading();
    }).catch(function(err) {
      console.log(err);
      util.showErrorToast('结算信息获取失败');
      wx.hideLoading();
    });
  },
  selectAddress() {
    wx.navigateTo({
      url: '/pages/ucenter/address/address',
    })
  },
  selectCoupon() {
    wx.navigateTo({
      url: '/pages/ucenter/couponSelect/couponSelect',
    })
  },
  bindMessageInput: function(e) {
    this.setData({
      message: e.detail.value
    });
  },
  onReady: function() {
    // 页面渲染完成

  },
  onShow: function() {
    // 页面显示
    wx.showLoading({
      title: '加载中...',
    });
    var ids = {
      cartId: 0,
      addressId: 0,
      couponId: 0,
      userCouponId: 0,
      grouponRulesId: 0,
      grouponLinkId: 0
    };
    try {
      ids.cartId = normalizeId(wx.getStorageSync('cartId'));
      ids.addressId = normalizeId(wx.getStorageSync('addressId'));
      ids.couponId = normalizeId(wx.getStorageSync('couponId'));
      ids.userCouponId = normalizeId(wx.getStorageSync('userCouponId'));
      ids.grouponRulesId = normalizeId(wx.getStorageSync('grouponRulesId'));
      ids.grouponLinkId = normalizeId(wx.getStorageSync('grouponLinkId'));
    } catch (e) {
      console.log(e);
    }

    this.setData(ids);
    this.getCheckoutInfo(ids);
  },
  onHide: function() {
    // 页面隐藏

  },
  onUnload: function() {
    // 页面关闭

  },
  submitOrder: function() {
    if (this.data.addressId <= 0) {
      util.showErrorToast('请选择收货地址');
      return false;
    }
    util.request(api.OrderSubmit, {
      cartId: this.data.cartId,
      addressId: this.data.addressId,
      couponId: this.data.couponId,
      userCouponId: this.data.userCouponId,
      message: this.data.message,
      grouponRulesId: this.data.grouponRulesId,
      grouponLinkId: this.data.grouponLinkId
    }, 'POST').then(res => {
      if (res.errno === 0) {

        // 下单成功，重置couponId
        try {
          wx.setStorageSync('couponId', 0);
        } catch (error) {

        }

        const orderId = res.data.orderId;
        const grouponLinkId = res.data.grouponLinkId;
        const payed = res.data.payed
        if (payed) {
          wx.redirectTo({
            url: '/pages/payResult/payResult?status=1&orderId=' + orderId
          });
          return
        }
        util.request(api.OrderPrepay, {
          orderId: orderId
        }, 'POST').then(function(res) {
          if (res.errno === 0) {
            const payParam = res.data;
            console.log("支付过程开始");
            wx.requestPayment({
              'timeStamp': payParam.timeStamp,
              'nonceStr': payParam.nonceStr,
              'package': payParam.packageValue,
              'signType': payParam.signType,
              'paySign': payParam.paySign,
              'success': function(res) {
                console.log("支付过程成功");
                if (grouponLinkId) {
                  setTimeout(() => {
                    wx.redirectTo({
                      url: '/pages/groupon/grouponDetail/grouponDetail?id=' + grouponLinkId
                    })
                  }, 1000);
                } else {
                  wx.redirectTo({
                    url: '/pages/payResult/payResult?status=1&orderId=' + orderId
                  });
                }
              },
              'fail': function(res) {
                console.log("支付过程失败");
                wx.redirectTo({
                  url: '/pages/payResult/payResult?status=0&orderId=' + orderId
                });
              },
              'complete': function(res) {
                console.log("支付过程结束")
              }
            });
          } else {
            wx.redirectTo({
              url: '/pages/payResult/payResult?status=0&orderId=' + orderId
            });
          }
        });

      } else {
        util.showErrorToast(res.errmsg);
      }
    });
  }
});
