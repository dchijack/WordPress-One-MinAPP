/**
 * Author : 丸子团队（波波、Chi、ONLINE.信）
 * Github 地址: https://github.com/dchijack/WordPress-One-MinAPP
 */
const API = require('../../utils/api')
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    user:'',
    page: 1,
    posts: [],
    opacity: 0,
    scrollTop: 0,
    loading: true,
    isLastPage: false,
    siteInfo: '',
    statusBarHeight: app.globalData.StatusBar
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.getSiteInfo();
    this.getPostList();
    setTimeout(() => {
      this.setData({
        loading: false
      })
    }, 800);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let user = app.globalData.user
    if (!user) {
      user = '';
    }
    this.setData({
      user: user,
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  },

  scrollHandler: function (e) {
    var { scrollTop } = e.detail;
    // 计算透明度
    var opacity = parseFloat(scrollTop / 250).toFixed(2);
    if (opacity > 1) opacity = 1;
    if (opacity < 0.1) opacity = 0;
    // 这里设置<300是减少setData次数，节省内存
    if (scrollTop < 300) {
      this.setData({
        opacity
      })
    }
  },

  getSiteInfo: function() {
    API.getSiteInfo().then(res => {
      this.setData({
        siteInfo: res
      })
    })
    .catch(err => {
      console.log(err)
    })
  },

  getPostList: function(data) {
    API.getPostsList(data).then(res => {
      let args = {}
      if (res.length < 10) {
        this.setData({
          isLastPage: true
        })
      }
      if (this.data.isBottom) {
        args.posts = [].concat(this.data.posts, res)
        args.page = this.data.page + 1
      } else {
        args.posts = [].concat(this.data.posts, res)
        args.page = this.data.page + 1
      }
      this.setData(args)
      wx.stopPullDownRefresh()
    })
    .catch(err => {
      console.log(err)
      wx.stopPullDownRefresh()
    })
  },
  redictDetail: function (e) {
    //console.log(e);
    var id = e.currentTarget.id;
    var url = '../detail/detail?id=' + id;
    wx.navigateTo({
      url: url
    })
  },
  getProfile: function (e) {
    console.log(e);
    wx.showLoading({
      title: '正在登录...',
    })
    API.getProfile().then(res => {
      console.log(res)
      this.setData({
        user: res
      })
      wx.hideLoading()
    })
    .catch(err => {
      console.log(err)
      wx.hideLoading()
    })
  },
  reFresh: function() {
    this.setData({
      page: 1,
      posts: [],
      opacity: 0,
      scrollTop: 0,
    })
    this.getPostList();
  },
  loadMore: function() {
    this.getPostList({page:this.data.page});
  }
})