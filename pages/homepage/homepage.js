// pages/homepage/homepage.js
const app = getApp()
const cookieUtil = require('../../utils/cookie.js')
const base64 = require('../../resources/images/base64.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    icon20: base64.icon20,
    isLogin: false,
    hasUserInfo: false,
    userInfo: null
  },

  // navigator跳转处理
  onNavigatorTap: function (event) {
    var that = this
    var cookie = cookieUtil.getCookieFromStorage()
    var header = {}
    header.Cookie = cookie
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/auth/status',
      header: header,
      success: function (res) {
        var data = res.data.data
        console.log(data)
        if (data.is_authorized == 1) {
          that.setData({
            isLogin: true
          })
          app.setAuthStatus(true)
        } else {
          that.setData({
            isLogin: false
          })
          app.setAuthStatus(false)
          wx.showToast({
            title: '请先授权登录',
          })
        }

        if (data.is_authorized == 1) {
          // 获取由 data-type 标签传递过来的参数
          console.log(event.currentTarget.dataset.type)
          var navigatorType = event.currentTarget.dataset.type
          if (navigatorType == 'focusCity') {
            navigatorType = 'cities'
          } else if (navigatorType == 'focusStock') {
            navigatorType = 'stocks'
          } else {
            navigatorType = 'constellations'
          }
          var url = '../picker/picker?type=' + navigatorType
          console.log('navigateTo url: ' + url)
          wx.navigateTo({
            url: '../picker/picker?type=' + navigatorType,
          })
        }
      }
    })
  },

  authorize: function () {
    console.log('authorize')
    var that = this
    
    // 首先获取用户信息
    app.getUserProfile(function(userRes, error) {
      if (error) {
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'error'
        })
        return
      }
      
      // 登录并获取cookie
      wx.login({
        success: function (res) {
          console.log(res)
          var code = res.code
          var appId = app.globalData.appId
          var nickName = userRes.userInfo.nickName
          
          // 请求后台
          wx.request({
            url: app.globalData.serverUrl + app.globalData.apiVersion + '/auth/authorize',
            method: 'POST',
            data: {
              code: code,
              appId: appId,
              nickName: nickName
            },
            header: {
              'content-type': 'application/json'
            },
            success(res) {
              wx.showToast({
                title: '授权成功',
              })
              // 保存cookie
              var cookie = cookieUtil.getSessionIDFromResponse(res)
              cookieUtil.setCookieToStorage(cookie)
              that.setData({
                isLogin: true,
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
              })
              app.setAuthStatus(true)
            }
          })
        }
      })
    })
  },

  logout: function () {
    var that = this
    var cookie = cookieUtil.getCookieFromStorage()
    var header = {}
    header.Cookie = cookie
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/auth/logout',
      method: 'GET',
      header: header,
      success(res) {
        // app.setAuthStatus(false)
        that.setData({
          isLogin: false,
          userInfo: null,
          hasUserInfo: false
        })
        cookieUtil.setCookieToStorage('')
        app.setAuthStatus(false)
      }
    })
  },

  getStatusFromRemote: function(){
    var cookie =cookieUtil.getCookieFromStorage()
    var header = {}
    header.Cookie = cookie
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/auth/status',
      method: 'GET',
      header: header,
      success: function(res){
        if(res.data.data.is_authorized == 1){
          console.log('登录状态')
        }else{
          console.log('Session过期，未登录状态')
        }
      }
    })
  }
})