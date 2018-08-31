/*
 * 
 * WordPres 连接微信小程序
 * Author: 守望轩 + 小鱼(vPush) + 艾码汇
 * github:  https://github.com/dchijack/WordPress-One-MinAPP
 * 技术支持：https://www.imahui.com  微信公众号：WordPress(搜索微信号：WPGeek)
 * 
 */

import config from 'config.js'
var domain = config.getDomain;
var pageCount = config.getPageCount;
var categoriesID = config.getCategoriesID;
var qrcodePath = config.getQrcodeUrl;
var HOST_URI = 'https://' + domain+'/wp-json/wp/v2/';
var HOST_WECHAT = 'https://' + domain + '/wp-json/wechat/v1/';
module.exports = {  
  // 获取文章列表数据
	getPosts: function (obj) {
		var url = HOST_URI + 'posts?per_page=20&orderby=date&order=desc&page=' + obj.page;
		if (obj.categories != 0) {
			url += '&categories=' + obj.categories;
		} else if (obj.search != '') {
			url += '&search=' + encodeURIComponent(obj.search);
		}  else if (obj.categories != 0 && obj.search != '') {
			url += '&categories=' + obj.categories + '&search=' + encodeURIComponent(obj.search);
		}   
		return url;
	},
	// 获取置顶的文章
	getStickyPosts: function () {
		var url = HOST_URI + 'posts?sticky=true&per_page=5&page=1';
		return url;
	},
	// 获取tag相关的文章列表
	getPostsByTags: function (id,tags) {
		var url = HOST_URI + 'posts?per_page=5&&page=1&exclude=' + id + "&tags=" + tags;
		return url;
	},
	// 获取特定id的文章列表
	getPostsByIDs: function (obj) {
		var url = HOST_URI + 'posts?include=' + obj;
		return url;
	},
	// 获取特定slug的文章内容
	getPostBySlug: function (obj) {
		var url = HOST_URI + 'posts?slug=' + obj;
		return url;
	},
	// 获取文章内容页
	getPostByID: function (id) {
		return HOST_URI + 'posts/' + id;
	},
	// 获取页面列表
	getPages: function () {
		return HOST_URI + 'pages';
	},
	// 获取页面内容
	getPageByID: function (id, obj) {
		return HOST_URI + 'pages/' + id;
	},
	//获取分类列表
	getCategories: function () {
		var url ='';
		if (categoriesID =='all'){
			url = HOST_URI + 'categories?orderby=id&order=asc';
		} else {
			url = HOST_URI + 'categories?include=' + categoriesID+'&orderby=id&order=asc';
		}
		return url
	},
	// 获取多个分类文章列表数据
	getPostsByCategories: function (categories) {
		var url = HOST_URI + 'posts?per_page=20&orderby=date&order=desc&page=1&categories=' + categories;
		return url;
	},
	//获取某个分类信息
	getCategoryByID: function (id) {
		var url = HOST_URI + 'categories/' + id;
		return url;
	},
	//获取最新20条评论
	getRecentComments: function () {
		return HOST_URI + 'comments?parent=0&per_page=20&orderby=date&order=desc';
	},
	//获取回复
	getReplyComments: function (obj) {
		var url= HOST_URI + 'comments?parent_exclude=0&per_page=20&orderby=date&order=desc&post=' + obj.postID
		return url;
	},
	//获取最近20条回复
	getRecentReplyComments:function(){
		return HOST_URI + 'comments?per_page=20&orderby=date&order=desc'
	},
	//提交评论
	addComment: function () {
		return HOST_URI + 'comments'
	}, 
	//获取某文章评论
	getComments: function (obj) {
		var url = HOST_URI + 'comments?per_page=20&orderby=date&order=asc&post=' + obj.postID + '&page=' + obj.page;
		return url;
	},
	/**自定义**/
	//获取首页滑动文章
	getSwiperPosts: function () {
		var url = HOST_WECHAT;
		url += 'views/swipe';
		return url;
	},
	//获取随机推荐文章
	getRandomPosts: function () {
		var url = HOST_WECHAT;
		url += 'views/random';
		return url;
	},
	//获取是否开启评论
	getEnableComment: function () {
		var url = HOST_WECHAT;
		url += 'comment/setting';
		return url;
	},
	//获取文章评论及回复
	getCommentsReplay: function (obj) {
		var url = HOST_WECHAT;
		url += 'comment/comments?postid=' + obj.postId + '&limit=' + obj.limit + '&page=' + obj.page + '&order=desc';
		return url;
	},
	//获取近期评论文章
	getRecentCommentPost: function (openid) {
		var url = HOST_WECHAT;
		return url + 'comment/recent';
	},
	//微信提交评论
	wechatAddComment: function () {
		var url = HOST_WECHAT;
		return url + 'comment/add'
	}, 
	//获取微信评论
	getWechatComment: function (openid) {
		var url = HOST_WECHAT;
		return url + 'comment/get?openid=' + openid;
	},
	//获取榜单 API
	getRankingPosts(flag){      
		var url = HOST_WECHAT;
		if(flag == 1) {
			// 热门阅读
			url +="views/most"
		} else if(flag== 2) {
			// 大家喜欢
			url += "thumbs/most"
		} else if (flag == 3) {
			// 热门评论
			url += "comment/most"
		} else if (flag == 4) {
			// 近期评论
			url += "comment/recent"
		}
		return url;
	},
	//更新浏览数
	updateViews(id) {
		var url = HOST_WECHAT;
		url += "views/update/"+id;
		return url;
	},
	//获取用户openid
	getOpenidUrl(id) {
		var url = HOST_WECHAT;
		url += "user/openid";
		return url;
	},
	//点赞
	updateThumbsUrl() {
		var url = HOST_WECHAT;
		url += "thumbs/up";
		return url;
	},
	//判断当前用户是否点赞
	getThumbedUrl() {
		var url = HOST_WECHAT;
		url += "thumbs/get";
		return url;
	},
	//获取我的点赞
	getMythumbsUrl(openid) {
		var url = HOST_WECHAT;
		url += "thumbs/user?openid=" + openid;
		return url;
	},
	//发送模版消息
	sendMessagesUrl() {
		var url = HOST_WECHAT;
		url += "message/send";
		return url;
	},
	//海报二维码生成
	creatPoster() {
		var url = HOST_WECHAT;
		url += "qrcode/creat";
		return url;
	},
	//获取二维码
	getQrcodeUrl() {
    var url = qrcodePath;
		return url;
	},
	//订阅分类 API
	subscribeUrl() {
		var url = HOST_WECHAT;
		url += "category/sub";
		return url;
	},
	//订阅分类文章
	getSubscribeUrl(openid) {
		var url = HOST_WECHAT;
		url += "category/get?openid=" + openid;
		return url;
	},
	//获取支付密钥
	praiseKeyUrl() {   
		var url = 'https://' + domain  + "/wp-wxpay/pay/app.php";
		return url;
	},
	//赞赏文章 API
	updatePraiseUrl() {
		var url = HOST_WECHAT;
		url += "praise/post";
		return url;
	},
	//获取我的赞赏
	getMyPraiseUrl(openid) {
		var url = HOST_WECHAT;
		url += "praise/user?openid=" + openid;
		return url;
	},
	//获取所有赞赏
	getAllPraiseUrl() {
		var url = HOST_WECHAT;
		url += "praise/all";
		return url;
	}
};