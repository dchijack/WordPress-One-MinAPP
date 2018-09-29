/*
 * 
 * WordPres 连接微信小程序
 * Author: 守望轩 + 小鱼(vPush) + 艾码汇
 * github:  https://github.com/dchijack/WordPress-One-MinAPP
 * 技术支持：https://www.imahui.com  微信公众号：WordPress(搜索微信号：WPGeek)
 * 
 */
import config from '../../utils/config.js'
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var auth = require('../../utils/auth.js');
var wxApi = require('../../utils/wxApi.js');
var WxParse = require('../../wxParse/wxParse.js');
var wxRequest = require('../../utils/wxRequest.js');
var info = wx.getSystemInfoSync();
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    opacity: 0,
    scrollTop: 0,
    categories: 0,
    firstImage:'',
    postsList: [],
    loading: true,
    isLastPage: false,
    title: config.getAppSite,
    userInfo: app.globalData.userInfo,
    statusBarHeight: info.statusBarHeight
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var self = this;
    self.getPostsList(this.data);
    setTimeout(() => {
      self.setData({
        loading: false
      })
    }, 500);
    if (!app.globalData.isGetOpenid) {
      self.getUsreInfo();
    } else {
      self.setData({
        userInfo: app.globalData.userInfo
      });
    }
    
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
    wx.setStorageSync('openLinkCount', 0);
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

  /**
   * 头部透明度函数
   */
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

  loadMore: function (e) {
    var self = this;
    if (!self.data.isLastPage) {
      self.setData({
        page: self.data.page + 1,
      });
      console.log('当前页' + self.data.page);
      this.getPostsList(self.data);
    } else {
      console.log(self.data.isLastPage);
      wx.showToast({
        title: '没有更多内容',
        mask: false,
        duration: 1000
      });
    }
  },

  /**
   * 获取文章列表
   */
  getPostsList: function (data) {
    var self = this;
    if (!data) data = {};
    if (!data.page) data.page = 1;
    if (!data.categories) data.categories = 0;
    if (!data.search) data.search = '';
    if (data.page === 1) {
      self.setData({
        postsList: []
      });
    };
    var getPostsRequest = wxRequest.getRequest(Api.getPosts(data));
    getPostsRequest.then(response => {
      //console.log(response);
      if (response.statusCode === 200) {
        //console.log(response.data.length);
        if (response.data[0].thumbnail) {
          var firstthumbnail = response.data[0].thumbnail
        } else {
          var firstthumbnail = response.data[0].meta.thumbnail
        }
        self.setData({
          firstImage: firstthumbnail,
          postsList: self.data.postsList.concat(response.data.map(function (item) {
            var strdate = item.date
            item.date = util.cutstr(strdate, 10, 1);
            item.title.rendered = util.removeHTML(item.title.rendered);
            item.content.rendered = util.removeHTML(item.content.rendered);
            //console.log(item);
            return item;
          }))
        });
      } else {
        if (response.data.code == "rest_post_invalid_page_number") {
          self.setData({
            isLastPage: true
          });
          wx.showToast({
            title: '没有更多内容',
            mask: false,
            duration: 1500
          });
        } else {
          wx.showToast({
            title: response.data.message,
            duration: 1500
          });
        }
      }
    })
    .catch(function (response) {
      wx.showModal({
        title: '加载失败',
        content: '加载数据失败, 请重试.',
        showCancel: false,
      });
      self.setData({
        page: data.page - 1
      });
    })
    .finally(function (response) {
      wx.stopPullDownRefresh();
    })
  },
  /**
   * 跳转至查看文章详情
   */
  redictDetail: function (e) {
    //console.log(e);
    var id = e.currentTarget.id;
    var url = '../detail/detail?id=' + id;
    wx.navigateTo({
      url: url
    })
  },
  /**
   * 用户授权查询
   */
  userAuthorization: function () {
    var self = this;
    // 判断是否是第一次授权，非第一次授权且授权失败则进行提醒
    wx.getSetting({
      success: function success(res) {
        //console.log(res.authSetting);
        var authSetting = res.authSetting;
        if (!('scope.userInfo' in authSetting)) {
          console.log('第一次授权');
          self.setData({ loginModal: true })
        } else {
          console.log('不是第一次授权', authSetting);
          // 没有授权的提醒
          if (authSetting['scope.userInfo'] === false) {
            wx.showModal({
              title: '用户未授权',
              content: '如需正常使用评论、点赞、赞赏等功能需授权获取用户信息。是否在授权管理中选中“用户信息”?',
              showCancel: true,
              cancelColor: '#296fd0',
              confirmColor: '#296fd0',
              confirmText: '设置权限',
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                  wx.openSetting({
                    success: function success(res) {
                      console.log('打开设置', res.authSetting);
                      var scopeUserInfo = res.authSetting["scope.userInfo"];
                      if (scopeUserInfo) {
                        auth.getUsreInfo(null);
                      }
                    }
                  });
                }
              }
            })
          } else {
            auth.getUsreInfo(null);
          }
        }
      }
    });
  },
  /**
   * 同意授权信息
   */
  bindGetUserinfo: function (e) {
    var userInfo = e.detail.userInfo;
    var self = this;
    if (userInfo) {
      auth.getUsreInfo(e.detail);
      self.setData({ userInfo: userInfo });
    }
  },
  /**
  * 获取用户信息
  */
  getUsreInfo: function () {
    var self = this;
    var wxLogin = wxApi.wxLogin();
    var jscode = '';
    wxLogin().then(response => {
      jscode = response.code
      var wxGetUserInfo = wxApi.wxGetUserInfo()
      return wxGetUserInfo()
    })
    //获取用户信息
    .then(response => {
      console.log(response.userInfo);
      console.log("成功获取用户信息(公开信息)");
      app.globalData.userInfo = response.userInfo;
      app.globalData.isGetUserInfo = true;
      self.setData({
        userInfo: response.userInfo
      });
      var url = Api.getOpenidUrl();
      var data = {
        js_code: jscode,
        encryptedData: response.encryptedData,
        iv: response.iv,
        avatarUrl: response.userInfo.avatarUrl
      }
      var postOpenidRequest = wxRequest.postRequest(url, data);
      //获取openid
      postOpenidRequest.then(response => {
        if (response.data.status == '200') {
          console.log("openid 获取成功");
          app.globalData.openid = response.data.openid;
          app.globalData.isGetOpenid = true;
        } else {
          console.log(response.data.message);
        }
      })
    })
    .catch(function (error) {
      console.log(error);
      self.userAuthorization();
    })
  }
})