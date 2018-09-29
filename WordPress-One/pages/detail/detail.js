/*
 * 
 * WordPres 连接微信小程序
 * Author: 守望轩 + 小鱼(vPush) + 艾码汇
 * github:  https://github.com/dchijack/WordPress-One-MinAPP
 * 技术支持：https://www.imahui.com  微信公众号：WordPress(搜索微信号：WPGeek)
 * 
 */
import config from '../../utils/config.js';
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var auth = require('../../utils/auth.js');
var wxApi = require('../../utils/wxApi.js');
var wxRequest = require('../../utils/wxRequest.js');
var WxParse = require('../../wxParse/wxParse.js');
var info = wx.getSystemInfoSync();
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '详情',
    detail: {},
    opacity: 0,
    scrollTop: 0,
    postID: null,
    prefix: '',
    userInfo: {},
    detailDate: '',
    wxParseData: [],
    isZanIcon: 'heart.png',
    dialog: {
      title: '',
      content: '',
      hidden: true
    },
    isShare: false,
    loginModal: false,
    logo: config.getAppLogo,
    userInfo: app.globalData.userInfo,
    statusBarHeight: info.statusBarHeight
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    this.fetchDetailData(options.id);
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
    return {
      title: config.getWebsiteName + '："' + this.data.detail.title.rendered + '"',
      path: 'pages/detail/detail?id=' + this.data.detail.id,
      imageUrl: this.data.detail.thumbnail,
      success: function (res) {
        // 转发成功
        console.log(res);
      },
      fail: function (res) {
        console.log(res);
        // 转发失败
      }
    }
  },
  /**
   * 滚动事件
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
  /**
   * 返回
   */
  goBackHandler: function () {
    wx.navigateBack({});
  },
  goHomeHandler: function () {
    var url = '../index/index';
    wx.navigateTo({
      url: url
    })
  },
  isThumbsClick: function (e) {
    var id = e.target.id;
    var self = this;
    if (app.globalData.isGetOpenid) {
      var data = {
        openid: app.globalData.openid,
        postid: self.data.postID
      };
      var url = Api.updateThumbsUrl();
      var getPostthumbsRequest = wxRequest.postRequest(url, data);
      getPostthumbsRequest.then(response => {
        if (response.data.status == '200') {
          var _thumbsList = []
          var _thumbs = app.globalData.userInfo.avatarUrl;
          _thumbsList.push(_thumbs);
          var tempthumbsList = _thumbsList.concat(self.data.likeList);
          wx.showToast({
            title: '谢谢点赞',
            icon: 'success',
            duration: 900,
            success: function () {
            }
          })
        } else if (response.data.status == '501') {
          console.log(response.data.message);
          wx.showToast({
            title: '谢谢，已赞过',
            icon: 'success',
            duration: 900,
            success: function () {
            }
          })
        } else {
            console.log(response.data.message);
        }
        self.setData({
          isZanIcon: "heart-o.png"
        });
      })
    } else {
      self.userAuthorization();
    }
  },
  isThumbsup: function () { //判断当前用户是否点赞
    var self = this;
    if (app.globalData.isGetOpenid) {
      var data = {
        openid: app.globalData.openid,
        postid: self.data.postID
      };
      var url = Api.getThumbedUrl();
      var postThumbedRequest = wxRequest.postRequest(url, data);
      postThumbedRequest.then(response => {
        console.log(response);
        if (response.data.status == '200') {
          self.setData({
            isZanIcon: "heart-o.png"
          });
          console.log("已赞过");
        }
      })
    }
  },
  //获取文章内容
  fetchDetailData: function (id) {
    var self = this;
    var res;
    var getPostDetailRequest = wxRequest.getRequest(Api.getPostByID(id));
    getPostDetailRequest.then(response => {
      res = response;
      WxParse.wxParse('article', 'html', response.data.content.rendered, self, 5);
      self.setData({
        detail: response.data,
        postID: id,
        link: response.data.link,
        detailDate: util.cutstr(response.data.date, 10, 1).split('-'),
        isShare: getCurrentPages().length === 1
      });
      // 调用API从本地缓存中获取阅读记录并记录
      var logs = wx.getStorageSync('readLogs') || [];
      // 过滤重复值
      if (logs.length > 0) {
        logs = logs.filter(function (log) {
          return log[0] !== id;
        });
      }
      // 如果超过指定数量
      if (logs.length > 9) {
        logs.pop();//去除最后一个
      }
      var title = response.data.title.rendered;
      var thumbnail = response.data.thumbnail;
      logs.unshift([id, response.data.title.rendered]);
      wx.setStorageSync('readLogs', logs);
      //end 
    })
    .then(response => {
      self.setData({
        title: res.data.title.rendered
      });
    })
    .then(response => {
      var updateViewsRequest = wxRequest.getRequest(Api.updateViews(id));
      updateViewsRequest.then(result => {
        console.log(result.data.message);
      })
    })
    .then(resonse => {
      if (!app.globalData.isGetOpenid) {
        self.userAuthorization();
      }
    })
    .then(response => {//获取是否已经点赞
      if (app.globalData.isGetOpenid) {
        self.isThumbsup();
      }
    })
    .catch(function (response) {

    })
    .finally(function (response) {

    })
  },
  /**
   * 判断是否存在海报
   */
  isPrefix: function () {
    var self = this;
    var date = self.data.detail.date;
    var category = self.data.detail.category;
    var writer = self.data.detail.author;
    var content = self.data.detail.content.rendered;
    var prefixPath = ""; // 定义海报路径
    var qrcodePath = ""; // 定义二维码路径
    var prefixLink = self.data.prefix;
    if (prefixLink) {
      var previewPrefix = [];
      previewPrefix.push(prefixLink);
      wx.previewImage({
        current: prefixLink,
        urls: previewPrefix
      });
    } else {
      self.downloadPrefix(prefixPath, qrcodePath, category, date, content, writer);
    }
  },
  /**
   * 创建海报
   */
  downloadPrefix: function (prefixPath, qrcodePath, category, date, content, author) {
    var self = this;
    var postid = self.data.detail.id;
    var path = "pages/detail/detail?id=" + postid;
    var prefixUrl = ""; // 定义海报头图
    var flag = false; // 判断标识
    var localImgFlag = false; // 本地图片标识
    var domain = config.getDomain; // 业务域名
    var downDomain = config.getDownloadFileDomain;  // 允许下载图像域名
    var thumbnail = self.data.detail.thumbnail;  // 海报缩略图
    //获取文章首图临时地址，若没有就用默认的图片,如果图片不是request域名，使用本地图片
    if (thumbnail) {
      var n = 0;
      for (var i = 0; i < downDomain.length; i++) {
        if (thumbnail.indexOf(downDomain[i].domain) != -1) {
          n++;
          break;
        }
      }
      if (n > 0) {
        localImgFlag = true;
        prefixUrl = thumbnail;
        prefixPath = prefixUrl;
      } else {
        prefixUrl = config.getPostImageUrl; // 默认海报地址
        prefixPath = prefixUrl;
        localImgFlag = true;
      }
    } else {
      localImgFlag = true;
      prefixUrl = config.getPostImageUrl;
      prefixPath = prefixUrl;
    }
    console.log(prefixPath);
    if (app.globalData.isGetOpenid) {
      var openid = app.globalData.openid;
      var data = {
        postid: postid,
        path: path,
        openid: openid
      };
      //console.log(data);
      var url = Api.creatPoster();
      var prefixQrcode = Api.getQrcodeUrl() + "qrcode-" + postid + ".png";
      var creatPosterRequest = wxRequest.postRequest(url, data);
      creatPosterRequest.then(response => {
        //console.log(response);
        if (response.statusCode == 200) {
          if (response.data.status == '200') {
            const downloadTaskQrcodeImage = wx.downloadFile({
              url: prefixQrcode,
              success: res => {
                if (res.statusCode === 200) {
                  qrcodePath = res.tempFilePath;
                  console.log("二维码图片本地位置：" + res.tempFilePath);
                  if (localImgFlag) {
                    const downloadTaskForPostImage = wx.downloadFile({
                      url: prefixPath,
                      success: res => {
                        if (res.statusCode === 200) {
                          prefixPath = res.tempFilePath;
                          console.log("文章图片本地位置：" + res.tempFilePath);
                          flag = true;
                          if (prefixPath && qrcodePath) {
                            self.createPostPrefix(prefixPath, qrcodePath, category, date, content, author);
                          }
                        } else {
                          console.log(res);
                          wx.hideLoading();
                          wx.showToast({
                            title: "生成海报失败...",
                            mask: true,
                            duration: 2000
                          });
                          return false;
                        }
                      }
                    });
                    downloadTaskForPostImage.onProgressUpdate((res) => {
                      console.log('下载文章图片进度：' + res.progress);
                      wx.showLoading({
                        title: "正在下载图片",
                        mask: true,
                      });
                    })
                  } else {
                    if (prefixPath && qrcodePath) {
                      self.createPostPrefix(prefixPath, qrcodePath, category, date, content, author);
                    }
                  }
                } else {
                  console.log(res);
                  flag = false;
                  wx.showToast({
                    title: "生成海报失败...",
                    mask: true,
                    duration: 2000
                  });
                  return false;
                }
              }
            });
            downloadTaskQrcodeImage.onProgressUpdate((res) => {
              console.log('下载二维码进度', res.progress);
              wx.showLoading({
                title: "下载二维码",
                mask: true,
              });
            })
          } else {
            console.log(response);
            flag = false;
            wx.showToast({
              title: "生成海报失败...",
              mask: true,
              duration: 2000
            });
            return false;
          }
        } else {
          console.log(response);
          flag = false;
          wx.showToast({
            title: "生成海报失败...",
            mask: true,
            duration: 2000
          });
          return false;
        }
      });
    }
  },
  //将canvas转换为图片保存到本地，然后将路径传给image图片的src
  createPostPrefix: function (prefixPath, qrcodePath, category, date, content, author) {
    //console.log(category);
    var that = this;
    //console.log(that.data);
    var categories = '标签 / ' + category;
    var datetime = util.cutstr(date, 10, 1).split('-');
    var yearmonth = datetime[0] + '/' + datetime[1];
    var writer = '—— ' + author;
    wx.showLoading({
      title: "正在生成海报",
      mask: true,
    });
    var context = wx.createCanvasContext('prefix');
    context.setFillStyle('#ffffff');//填充背景色
    context.fillRect(0, 0, 600, 970);
    context.drawImage(prefixPath, 0, 0, 600, 300);//绘制首图
    context.drawImage('/assets/box@2x.png', 20, 180, 560, 740);//绘制首图
    context.drawImage(qrcodePath, 250, 770, 100, 100);//绘制二维码
    context.setFillStyle("#666666");
    context.setFontSize(20);
    context.setTextAlign('center');
    context.fillText(categories, 305, 285);
    context.setFillStyle("#000000");
    context.setFontSize(120);
    context.setTextAlign('center');
    context.fillText(datetime[2], 300, 420);
    context.setFillStyle("#666666");
    context.setFontSize(40);
    context.setTextAlign('center');
    context.fillText(yearmonth, 300, 480);
    context.setFillStyle("#696969");
    context.setFontSize(20);
    context.setTextAlign('right');
    context.fillText(writer, 520, 740);
    context.setFillStyle("#696969");
    context.setFontSize(20);
    context.setTextAlign('center');
    context.fillText("阅读详情,请长按识别二维码", 300, 930);
    context.stroke();
    // this.setUserInfo(context);//用户信息        
    util.drawTitleExcerpt(context, content);//内容
    context.draw();
    //将生成好的图片保存到本地，需要延迟一会，绘制期间耗时
    setTimeout(function () {
      wx.canvasToTempFilePath({
        canvasId: 'prefix',
        success: function (res) {
          that.data.prefix = res.tempFilePath;
          wx.hideLoading();
          var previewPrefix = [];
          previewPrefix.push(that.data.prefix);
          wx.previewImage({
            current: that.data.prefix,
            urls: previewPrefix
          });
          console.log("海报图片路径：" + res.tempFilePath);
        },
        fail: function (res) {
          console.log(res);
        }
      });
    }, 900);
  },
  /**
   * 用户授权查询
   */
  userAuthorization: function () {
    var self = this;
    // 判断是否是第一次授权，非第一次授权且授权失败则进行提醒
    wx.getSetting({
      success: function success(res) {
        console.log(res.authSetting);
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
    setTimeout(function () {
      self.setData({ loginModal: false })
    }, 1200);
  },
  /**
   * 弹出框蒙层截断 touchmove 事件
   */
  preventTouchMove: function () {

  },
  /**
   * 隐藏模态对话框
   */
  hideModal: function () {
    this.setData({
      loginModal: false,
    });
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function () {
    this.hideModal();
  },
  /**
  * 确认数据
  */
  confirm: function () {
    this.setData({
      'dialog.hidden': true,
      'dialog.title': '',
      'dialog.content': ''
    })
  }
})