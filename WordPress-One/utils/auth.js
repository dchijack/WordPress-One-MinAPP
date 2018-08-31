/*
 * 
 * WordPres 连接微信小程序
 * Author: 守望轩 + 小鱼(vPush) + 艾码汇
 * github:  https://github.com/dchijack/WordPress-One-MinAPP
 * 技术支持：https://www.imahui.com  微信公众号：WordPress(搜索微信号：WPGeek)
 * 
 */
var Api = require('api.js');
var util = require('util.js');
var wxApi = require('wxApi.js')
var wxRequest = require('wxRequest.js')
var app = getApp();
module.exports = {
    // 获取用户信息
    getUsreInfo: function (userInfoDetail) {       
        var wxLogin = wxApi.wxLogin();
        var jscode = '';
        wxLogin().then(response => {
            jscode = response.code
            if (userInfoDetail ==null) {
                var userInfo = wxApi.wxGetUserInfo();
                return userInfo();
            } else {                
                return userInfoDetail;
            } 
        })
        //获取用户信息
        .then(response => {
            console.log(response.userInfo);
            console.log("成功获取用户信息(公开信息)");
            app.globalData.userInfo = response.userInfo;
            app.globalData.isGetUserInfo = true;
            var data = {
                js_code: jscode,
                encryptedData: response.encryptedData,
                iv: response.iv,
                avatarUrl: response.userInfo.avatarUrl,
                nickname: response.userInfo.nickName
            }
            this.getOpenId(data);                              
        })
		.catch(function (error) {
            console.log('error: ' + error.errMsg);
        })
    },
	// 获取用户 OpenID
    getOpenId(data) {
        var url = Api.getOpenidUrl();        
        var postOpenidRequest = wxRequest.postRequest(url, data);
        //获取openid
        postOpenidRequest.then(response => {
            if (response.data.status == '200') {
                //console.log(response.data.openid)
                console.log("openid 获取成功");
                app.globalData.openid = response.data.openid;
                app.globalData.isGetOpenid = true;
            } else {
                console.log(response);
            }
        }) 
    }
}