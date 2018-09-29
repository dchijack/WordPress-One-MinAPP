/*
 * 
 * WordPres 连接微信小程序
 * Author: 守望轩 + 小鱼(vPush) + 艾码汇
 * github:  https://github.com/dchijack/WordPress-One-MinAPP
 * 技术支持：https://www.imahui.com  微信公众号：WordPress(搜索微信号：WPGeek)
 * 
 */

//配置域名,域名只修改此处。
//如果wordpress没有安装在网站根目录请加上目录路径,例如："demo.imahui.com/blog"
var DOMAIN = "demo.imahui.com";
var WEBSITENAME="WordPress One 演示版";   //网站名称
var ABOUTID = 2;  //wordpress网站"页面"的id,注意这个"页面"是wordpress的"页面"，不是"文章"
var PAGECOUNT='10'; //每页文章数目
var CATEGORIESID='all'  //专题页显示全部的分类
var PAYTEMPPLATEID = 'hzKpxuPF2rw7O-qTElkeoE0lMwr0O4t9PJkLyt6v8rk';//赞赏消息模版id
var REPLAYTEMPPLATEID = 'IiAVoBWP34u1uwt801rI_Crgen7Xl2lvAGP67ofJLo8';//回复评论消息模版id
var LOGO = "../../assets/logo.png"; // 网站的logo图片
var POSTERIMGURL ="https://demo.imahui.com/wp-content/uploads/2018/08/1535254954-1.jpg"; //生成海报如果没有首图，使用此处设置的图片作为海报图片。
var QRCODEURL = "https://demo.imahui.com/wp-content/uploads/qrcode/" //二维码网址目录

//此处设置的域名和小程序与小程序后台设置的downloadFile合法域名要一致。
var DOWNLOADFILEDOMAIN = [
    { id: 1, domain: 'www.imahui.coom' },
    { id: 2, domain: 'demo.imahui.com' }
]

export default {
  getDomain: DOMAIN,
  getAppSite: WEBSITENAME,
  getAboutId: ABOUTID,
  getPayTemplateId: PAYTEMPPLATEID,
  getPageCount: PAGECOUNT,
  getCategoriesID :CATEGORIESID,
  getReplayTemplateId: REPLAYTEMPPLATEID,
  getLogo: LOGO,
  getPostImageUrl: POSTERIMGURL,
  getDownloadFileDomain: DOWNLOADFILEDOMAIN,
  getQrcodeUrl: QRCODEURL
}