var util = require('./utils/util.js');
var api = require('./config/api.js');
var user = require('./utils/user.js');

App({
  onLaunch: function() {
    Promise.prototype.finally = function(callback){
      let P = this.constructor;
      return this.then(
              value => {
                   P.resolve(callback()).then(() => value)
               },
               reason => {
                   P.resolve(callback()).then(() => { throw reason })
               }
           )
    }
    const updateManager = wx.getUpdateManager();
    wx.getUpdateManager().onUpdateReady(function() {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })
    this.checkLicense();
  },
  onShow: function(options) {
    user.checkLogin().then(res => {
      this.globalData.hasLogin = true;
    }).catch(() => {
      this.globalData.hasLogin = false;
    });
    this.checkLicense();
  },
  checkLicense: function() {
    if (this.globalData.licenseLocked || this.globalData.licenseChecking) {
      return;
    }
    this.globalData.licenseChecking = true;
    var that = this;
    util.request(api.LicenseUrl).then(function(res) {
      that.globalData.licenseChecking = false;
      if (!res || res.errno !== 0 || !res.data) {
        return;
      }
      var expireYear = String(res.data.expireYear || '').trim();
      if (!expireYear) {
        return;
      }
      var currentYear = String(new Date().getFullYear());
      if (expireYear !== currentYear) {
        return;
      }
      that.globalData.licenseLocked = true;
      wx.showModal({
        title: '提示',
        content: '服务已到期，无法继续使用',
        showCancel: false,
        success: function() {
          wx.exitMiniProgram({
            fail: function() {}
          });
        }
      });
    }).catch(function() {
      that.globalData.licenseChecking = false;
    });
  },
  globalData: {
    hasLogin: false,
    licenseLocked: false,
    licenseChecking: false
  }
})