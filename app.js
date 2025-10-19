// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },

  //用于返回当前的用户状态
  getAuthStatus: function () {
    return this.globalData.auth.isAuthorized
  },

  //设置用户状态
  setAuthStatus: function (status) {
    console.log('set auth status: ' + status)
    if (status == true || status == false) {
      this.globalData.auth.isAuthorized = status
    } else {
      console.log('invalid status.')
    }
  },

  // 现代方式获取用户信息 - 需要用户主动触发
  getUserProfile: function(callback) {
    wx.getUserProfile({
      desc: '用于完善用户资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        this.globalData.userInfo = res.userInfo
        console.log('getting user info')
        console.log(res)
        this.setAuthStatus(true)
        if (callback) {
          callback(res)
        }
      },
      fail: (err) => {
        console.log('获取用户信息失败:', err)
        this.setAuthStatus(false)
        if (callback) {
          callback(null, err)
        }
      }
    })
  },

  globalData: {
    userInfo: null,
    serverUrl: 'http://127.0.0.1:8000',
    apiVersion: '/api/v1.0',
    appId: 'yourappid',
    auth:{
      isAuthorized:false
    }
  }
})
