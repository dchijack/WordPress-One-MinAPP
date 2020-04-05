/**
 * Author : 丸子团队（波波、Chi、ONLINE.信）
 * Github 地址: https://github.com/dchijack/WordPress-One-MinAPP
 */
const API = require('../../utils/api')
const WxParse = require('../../wxParse/wxParse')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: 0,
    user: '',
    title: '详情',
    detail: '',
    opacity: 0,
    scrollTop: 0,
    prefix: '',
    isShare: false,
    statusBarHeight: app.globalData.StatusBar
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.id) {
      this.setData({
        id: options.id
      })
      this.getPostsbyID(options.id)
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
    return {
      title: this.data.detail.excerpt.rendered,
      path: 'pages/detail/detail?id=' + this.data.detail.id,
      imageUrl: this.data.detail.meta.thumbnail,
    }
  },
  scrollHandler: function (e) {
    var { scrollTop } = e.detail;
    var opacity = parseFloat(scrollTop / 250).toFixed(2);
    if (opacity > 1) opacity = 1;
    if (opacity < 0.1) opacity = 0;
    if (scrollTop < 300) {
      this.setData({
        opacity
      })
    }
  },
  goBackHandler: function () {
    wx.navigateBack({});
  },
  goHomeHandler: function () {
    var url = '../index/index';
    wx.navigateTo({
      url: url
    })
  },
  getPostsbyID: function(id) {
    let that = this;
    let current = getCurrentPages()
		if(current.length === 1) {
      this.setData({
        isShare: true
      })
		}
    API.getPostsbyID(id).then(res => {
      that.setData({
        id: id,
        detail: res
      })
      WxParse.wxParse('article', 'html', res.content.rendered, this, 5);
      if (res.comments != 0) {
        this.getComments()
      }
    })
    .catch(err => {
      console.log(err)
    })
  },
  bindLike: function(e) {
    let args = {}
    let detail = this.data.detail
    args.id = detail.id
    API.like(args).then(res => {
      //console.log(res)
      if (res.status === 200) {
        detail.islike = true
        this.setData({
          detail: detail,
        })
        wx.showToast({
          title: '谢谢点赞!',
          icon: 'success',
          duration: 900,
        })
      } else if (res.status === 202) {
        detail.islike = false
        this.setData({
          detail: detail,
        })
        wx.showToast({
          title: '取消点赞!',
          icon: 'success',
          duration: 900,
        })
      } else {
        wx.showModal({
          title: '温馨提示',
          content: '数据出错, 建议清除缓存重新尝试',
          success: response => {
            wx.removeStorageSync('user')
            wx.removeStorageSync('token')
            wx.removeStorageSync('expired_in')
          }
        })
      }
    })
    .catch(err => {
      console.log(err)
    })
  },
  isPrefix: function() {
    let prefix = this.data.prefix
    if (prefix) {
      wx.previewImage({
        current: prefix,
        urls: [prefix]
      });
    } else {
      this.creatPrefix(this.data.detail)
    }
  },
  creatPrefix:function (data) {
    let args = {}
    let prefix = ''
    let qrcode = ''
    let category = data.category[0].name
    let date = data.date
    let content = data.excerpt.rendered
    let author = data.author.name
    args.id = data.id
    wx.showToast({
      title: '准备生成...',
      icon: 'success',
      duration: 900,
    })
    API.getCodeImg(args).then(res => {
      //console.log(res)
      if(res.status === 200) {
        let qrcodeurl = res.qrcode
        let coverurl = res.cover
        wx.downloadFile({
          url: qrcodeurl,
          success: res => {
            wx.showToast({
              title: '下载二维码...',
              icon: 'success',
              duration: 1200,
            })
            if (res.statusCode === 200) {
              qrcode = res.tempFilePath
              console.log("二维码图片本地位置：" + res.tempFilePath)
              wx.downloadFile({
                url:coverurl,
                success: res => {
                  wx.showToast({
                    title: '下载封面图...',
                    icon: 'success',
                    duration: 1200,
                  })
                  if (res.statusCode === 200) {
                    prefix = res.tempFilePath
                    console.log("文章图片本地位置：" + res.tempFilePath)
                    this.createCanvas(prefix, qrcode, category, date, content, author)
                  }
                }
              })
            }
          }
        })
      }
    })
    .catch(err => {
      console.log(err)
    })
  },
  createCanvas: function (prefix, qrcode, category, date, content, author) {
    let that = this;
    let categories = '标签 / ' + category;
    let datetime = date.split(' ');
    let datearr = datetime[0].split('-');
    let yearmonth = datearr[0] + '/' + datearr[1];
    let writer = '—— ' + author;
    wx.showLoading({
      title: "生成海报",
      mask: true,
    });
    let context = wx.createCanvasContext('prefix');
    context.setFillStyle('#ffffff');//填充背景色
    context.fillRect(0, 0, 600, 970);
    context.drawImage(prefix, 0, 0, 600, 300);//绘制首图
    context.drawImage('/assets/box@2x.png', 20, 180, 560, 740);//绘制首图
    context.drawImage(qrcode, 250, 770, 100, 100);//绘制二维码
    context.setFillStyle("#666666");
    context.setFontSize(20);
    context.setTextAlign('center');
    context.fillText(categories, 305, 285);
    context.setFillStyle("#000000");
    context.setFontSize(120);
    context.setTextAlign('center');
    context.fillText(datearr[2], 300, 420);
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
    context.setFillStyle("#000000");
    context.setFontSize(24);
    context.setTextAlign('left');
    context.setGlobalAlpha(0.7);
    for (var i = 0; i <= 80; i += 18) {
        //摘要只绘制前50个字，这里是用截取字符串
        if (content.replace(/[\u0391-\uFFE5]/g, "aa").length>80) {
            if ( i == 40) {
              context.fillText(content.substring(i, i + 18) + "...", 80, 540 + i * 2);
            } else {
              context.fillText(content.substring(i, i + 18), 80, 540 + i * 2);
            }
        } else {
          context.fillText(content.substring(i, i + 18), 80, 540 + i * 2);
        }
    }
    context.stroke();
    context.save();
    context.draw();
    //将生成好的图片保存到本地，需要延迟一会，绘制期间耗时
    setTimeout(function () {
      wx.canvasToTempFilePath({
        canvasId: 'prefix',
        success: function (res) {
          that.data.prefix = res.tempFilePath;
          wx.hideLoading();
          wx.previewImage({
            current: that.data.prefix,
            urls: [that.data.prefix]
          });
          console.log("海报图片路径：" + res.tempFilePath);
        },
        fail: function (res) {
          console.log(res);
        }
      });
    }, 900);
  }
})