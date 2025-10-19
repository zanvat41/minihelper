// pages/weather/weather.js
const app = getApp()

const popularCities = ["北京", "上海", "广州", "佛山"]

Page({
  data: {
    isAuthorized: false,
    weatherData: null
  },

  onLoad(options) {
    this.updateWeatherData()
  },

  updateWeatherData() {
    wx.showLoading({
      title: '加载中',
    })

    var that = this
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/weather',
      method: 'POST',
      data: {
        cities: popularCities
      },
      success(res) {
        var tempData = res.data.data
        console.log(res)
        console.log(tempData)
        that.setData({
          weatherData: tempData
        })
        wx.hideLoading()
      },
      fail(res) {
        wx.hideLoading()
      }
    })
  },

  onPullDownRefresh() {
    this.updateWeatherData()
  }
})