// index.js
const app = getApp()
const cookieUtil = require('../../utils/cookie.js')

Page({
  data: {
    isAuthorized: false,
    constellationData: null,
    stockData: null,
    weatherData: null
  },

  updateData() {
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    var cookie = cookieUtil.getCookieFromStorage()
    var header = {}
    header.Cookie = cookie
    var callCount = 0

    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/weather',
      header: header,
      success(res) {
        that.setData({
          weatherData: res.data.data
        })
        callCount++
        if (callCount == 3) {
          wx.hideLoading()
        }
      },
      fail(res) {
        callCount++
        if (callCount == 3) {
          wx.hideLoading()
        }
      }
    })

    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/stock',
      header: header,
      success(res) {
        var stockData = res.data.data
        // Process each stock item to add is_rising field
        stockData.forEach(item => {
          item.is_rising = that.checkStockRising(item.increase)
        })
        that.setData({
          stockData: stockData
        })
        callCount++
        if (callCount == 3) {
          wx.hideLoading()
        }
      },
      fail(res) {
        callCount++
        if (callCount == 3) {
          wx.hideLoading()
        }
      }
    })

    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/constellation',
      header: header,
      success(res) {
        that.setData({
          constellationData: res.data.data
        })
        callCount++
        if (callCount == 3) {
          wx.hideLoading()
        }
      },
      fail(res) {
        callCount++
        if (callCount == 3) {
          wx.hideLoading()
        }
      }
    })
  },

  onPullDownRefresh() {
    var that = this
    var cookie = cookieUtil.getCookieFromStorage()
    var header = {}
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
          that.updateData()
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

  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  
  checkStockRising(increase) {
    console.log('Stock increase value:', increase)
    if (!increase) return false
    
    // Check if increase value starts with '+' (rising) or '-' (falling)
    if (typeof increase === 'string') {
      return increase.startsWith('+')
    }
    
    return false
  },

  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    const { nickName } = this.data.userInfo
    this.setData({
      "userInfo.avatarUrl": avatarUrl,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })

    app.globalData.userInfo = this.data.userInfo
  },
  onInputChange(e) {
    const nickName = e.detail.value
    const { avatarUrl } = this.data.userInfo
    this.setData({
      "userInfo.nickName": nickName,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })

    app.globalData.userInfo = this.data.userInfo
  },
  getUserProfile(e) {
    wx.getUserProfile({
      desc: '展示用户信息',
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  }
})
