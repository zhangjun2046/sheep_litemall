var api = require('../config/api.js');
var app = getApp();

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 微信基础库已禁止 <image> 使用 HTTP，将外链统一升级为 HTTPS。
 * 本地存储地址（localhost/127.0.0.1）保留 HTTP，便于本地联调。
 */
function upgradeHttpUrl(value) {
  if (typeof value !== 'string' || value.indexOf('http://') !== 0) {
    return value;
  }
  if (value.indexOf('http://localhost') === 0 || value.indexOf('http://127.0.0.1') === 0) {
    return value;
  }
  return 'https://' + value.substring('http://'.length);
}

function upgradeHttpInData(data) {
  if (Array.isArray(data)) {
    return data.map(upgradeHttpInData);
  }
  if (data && typeof data === 'object') {
    var result = {};
    for (var key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = upgradeHttpInData(data[key]);
      }
    }
    return result;
  }
  return upgradeHttpUrl(data);
}

/**
 * 封封微信的的request
 */
function request(url, data = {}, method = "GET") {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: url,
      data: data,
      method: method,
      header: {
        'Content-Type': 'application/json',
        'X-Litemall-Token': wx.getStorageSync('token')
      },
      success: function(res) {

        if (res.statusCode == 200) {

          if (res.data.errno == 501) {
            // 清除登录相关内容
            try {
              wx.removeStorageSync('userInfo');
              wx.removeStorageSync('token');
            } catch (e) {
              // Do something when catch error
            }
            // 切换到登录页面
            wx.navigateTo({
              url: '/pages/auth/login/login'
            });
          } else {
            resolve(upgradeHttpInData(res.data));
          }
        } else {
          reject(res.errMsg);
        }

      },
      fail: function(err) {
        reject(err)
      }
    })
  });
}

function redirect(url) {

  //判断页面是否需要登录
  if (false) {
    wx.redirectTo({
      url: '/pages/auth/login/login'
    });
    return false;
  } else {
    wx.redirectTo({
      url: url
    });
  }
}

function showErrorToast(msg) {
  wx.showToast({
    title: msg,
    image: '/static/images/icon_error.png'
  })
}

module.exports = {
  formatTime,
  request,
  redirect,
  showErrorToast
}