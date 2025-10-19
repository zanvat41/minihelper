const app = getApp()
const cookieUtil = require('../../utils/cookie.js')

Page({
  data: {
    grids: [],
    isAuthorized: false
  },
  onShow() {
    this.checkAuthorization()
  },
  
  onPullDownRefresh: function(){
    this.checkAuthorization()
  },

  checkAuthorization: function(){
    var that = this
    var header = {}
    var cookie = cookieUtil.getCookieFromStorage()
    header.Cookie = cookie

    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/auth/status',
      header: header,
      success(res) {
        var data = res.data.data
        console.log('here is the global')
        console.log(app.globalData.auth.isAuthorized)
        if(data.is_authorized == 1 && app.globalData.auth.isAuthorized) {
          that.setData({
            isAuthorized: true
          })
          that.updateMenuData()
        } else {
          that.setData({
            isAuthorized: false
          })

          wx.showToast({
            title: '请先授权登录',
            icon: 'error'
          })
        }
      }
    })
  },
  
  updateMenuData: function(){
    /*
    var that = this
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/menu',
      success: function(res){
        var menuData = res.data.data
        that.setData({
          grids:menuData
        })
      }
    })
    */
    var that = this
    var header = {}
    var cookie = cookieUtil.getCookieFromStorage()
    header.Cookie = cookie

    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/auth/user',
      method: 'GET',
      header: header,
      success(res){
        console.log(res)
        that.setData({
          grids: res.data.data.focus.menu
        })
      }
    })
  },

  onNavigatorTap: function(e){
    console.log("tapping app navigator")
    var index = e.currentTarget.dataset.index
    console.log(e.currentTarget.dataset)
    var appItem = this.data.grids[index]
    console.log(appItem)
    if(appItem.application == "weather"){
      wx.navigateTo({
        url: '../weather/weather',
      })
    } else if(appItem.application == "image_backup"){
      wx.navigateTo({
        url: '../backup/backup',
      })
    } else if(appItem.application == "stock"){
      wx.navigateTo({
        url: '../stock/stock',
      }) 
    } else if(appItem.application == "constellation"){
      wx.navigateTo({
        url: '../service/service?type=constellation',
      }) 
    } else if(appItem.application == "jokes"){
      wx.navigateTo({
        url: '../service/service?type=jokes',
      }) 
    }
  },

  onAddApp: function() {
    wx.navigateTo({
      url: '../picker/picker?type=menu'
    })
  }
});