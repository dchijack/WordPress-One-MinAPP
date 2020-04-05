/**
 * Author : 丸子团队（波波、Chi、ONLINE.信）
 * Github 地址: https://github.com/dchijack/WordPress-One-MinAPP
 */
const API = require('/utils/base')

App({
  onLaunch: function () {
    API.login();
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        this.globalData.CustomBar = e.platform == 'android' ? e.statusBarHeight + 50 : e.statusBarHeight + 45;
      }
    })
  },
  onShow: function () {
    this.globalData.user = API.getUser();
  },
  globalData: {
    user: '',
    StatusBar: '',
    CustomBar: ''
  }
})