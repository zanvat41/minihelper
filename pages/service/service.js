const app = getApp()

Page({
  data: {
    isConstellationView: false,
    isJokesView: false,
    constellationData: null,
    jokesData: null
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
    var isConstellationViewTmp = false
    var isJokesViewTmp = false
    if(options.type == 'constellation'){
      isConstellationViewTmp = true
      this.updateConstellationData()
    } else{
      isJokesViewTmp = true
      this.updateJokesData()
    }
    this.setData({
      isConstellationView: isConstellationViewTmp,
      isJokesView: isJokesViewTmp
    })
  },

  updateConstellationData() {
    wx.showLoading({
      title: '加载中',
    })

    var that = this
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/constellation',
      method: 'GET',
      success(res) {
        var tempData = res.data.data
        console.log(res)
        console.log(tempData)
        that.setData({
          constellationData: tempData
        })
        wx.hideLoading()
      },
      fail(res) {
        wx.hideLoading()
      }
    })
  },

  updateJokesData() {
    wx.showLoading({
      title: '加载中',
    })

    var that = this
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/jokes',
      method: 'GET',
      success(res) {
        var tempData = res.data.data
        console.log(res)
        console.log(tempData)
        that.setData({
          jokesData: tempData
        })
        wx.hideLoading()
      },
      fail(res) {
        wx.hideLoading()
      }
    })
  }
})