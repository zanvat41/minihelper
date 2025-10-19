const app = getApp()

Page({
  data: {
    stockData: []
  },

  onLoad(options) {
    this.updateStockData()
  },

  updateStockData() {
    wx.showLoading({
      title: '加载中',
    })

    var that = this
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/stock',
      method: 'GET',
      success(res) {
        var tempData = res.data.data
        console.log(res)
        console.log(tempData)
        that.setData({
          stockData: tempData
        })
        wx.hideLoading()
      },
      fail(res) {
        wx.hideLoading()
      }
    })
  },

  onPullDownRefresh() {
    this.updateStockData()
  }
})