// pages/picker/picker.js
const cookieUtil = require('../../utils/cookie.js')
const szStock = require('../../resources/data/stock/sz-100.js')
const shStock = require('../../resources/data/stock/sh-100.js')
const app = getApp()

var allStockData = []
Array.prototype.push.apply(allStockData, szStock.data)
Array.prototype.push.apply(allStockData, shStock.data)
console.log(allStockData)

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isConstellPicker: false,
    isStockPicker: false,
    isCityPicker: false,
    isMenuPicker: false,
    personal: {
      constellations: [],
      cities: [],
      stocks: [],
      menu: []
    },
    allPickerData: {
      allConstellations: ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'],
      allStocks: allStockData,
      allApps: []
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      isCityPicker: false,
      isConstellPicker: false,
      isStockPicker: false,
      isMenuPicker: false
    })
    if(options.type == 'cities'){
      this.setData({
        isCityPicker: true
      })
    } else if(options.type == 'constellations'){
      this.setData({
        isConstellPicker: true
      })
    } else if(options.type == 'stocks'){
      this.setData({
        isStockPicker: true
      })
    } else if(options.type == 'menu'){
      this.loadAvailableApps()
      this.setData({
        isMenuPicker: true
      })
    } else{
      console.log('wrong type')
      return
    }

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
        var personalData = res.data.data.focus || {}
        // Ensure menu array exists
        if (!personalData.menu) {
          personalData.menu = []
        }
        that.setData({
          personal: personalData
        })
      }
    })
  },

  loadAvailableApps: function() {
    var that = this
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/menu',
      success: function(res) {
        var apps = res.data.data || []
        that.setData({
          'allPickerData.allApps': apps
        })
        console.log('Available apps loaded:', apps)
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onSave(isShowModal=True) {
    var that = this
    var header = {}
    var cookie = cookieUtil.getCookieFromStorage()
    header.Cookie = cookie
    
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/auth/user',
      method: 'POST',
      header: header,
      data: {
        cities: that.data.personal.cities,
        constellations: that.data.personal.constellations,
        stocks: that.data.personal.stocks,
        menu: that.data.personal.menu
      },
      success(res) {
        console.log(res)
        
        wx.showToast({
          title: '保存成功',
        })
      }
    })
  },

  bindConstellationPickerChange: function(e) {
    console.log('constellPicker发送选择改变,携带值为', e.detail.value)
    var newItem = this.data.allPickerData.allConstellations[e.detail.value]
    var newData = this.data.personal.constellations
    if (newData.indexOf(newItem) > -1){
      console.log('selected consteallation already exists')
      return
    }
    newData.push(newItem)
    var newPersonalData = this.data.personal
    newPersonalData.constellations = newData
    this.setData({
      personal: newPersonalData
    })
  },

  bindStockPickerChange: function(e) {
    var newItem = this.data.allPickerData.allStocks[e.detail.value]
    var newData = this.data.personal.stocks
    // 去重
    for (var i = 0; i < newData.length; i++) {
      if (newData[i].name == newItem.name && newData[i].code == newItem.code && newData[i].market == newItem.market) {
        console.log('selected stock already exists.')
        return
      }
    }
    newData.push(newItem)
    var newPersonalData = this.data.personal
    newPersonalData.stocks = newData
    this.setData({
      personal: newPersonalData
    })
  },

  bindAppPickerChange: function(e) {
    console.log('appPicker发送选择改变,携带值为', e.detail.value)
    var newItem = this.data.allPickerData.allApps[e.detail.value]
    var newData = this.data.personal.menu || []
    
    console.log(newItem)
    // 去重
    var exists = newData.some(app => {
      return (app.app && app.app.appid === newItem.appid) || 
             (app.appid === newItem.appid)
    })
    
    if (exists) {
      console.log('selected app already exists (appid: ' + (newItem.app ? newItem.app.appid : newItem.appid) + ')')
      wx.showToast({
        title: '应用已存在',
        icon: 'none'
      })
      return
    }
    
    newData.push(newItem)
    var newPersonalData = this.data.personal
    newPersonalData.menu = newData
    this.setData({
      personal: newPersonalData
    })
  },

  bindRegionPickerChange: function(e) {
    console.log('cityPicker发送选择改变,携带值为', e.detail.value)
    var pickerValue = e.detail.value
    var newItem = {
      province: pickerValue[0],
      city: pickerValue[1],
      area: pickerValue[2],
    }
    //var newItem = pickerValue[1]

    var newData = this.data.personal.cities
    // 去重
    for (var i = 0; i < newData.length; i++) {
      if (newData[i].province == newItem.province && newData[i].city == newItem.city &&
        newData[i].area == newItem.area) {
        console.log('selected city already exists.')
        return
      }
    }

    //if (newData.indexOf(newItem) > -1) {
    //  console.log('selected city already exists')
    //  return
    //}

    newData.push(newItem)
    var newPersonalData = this.data.personal
    newPersonalData.cities = newData
    this.setData({
      personal: newPersonalData
    })
  },

  deleteItem(e) {
    var that = this
    var index = e.currentTarget.dataset.index
    var type = e.currentTarget.dataset.type
    
    wx.showModal({
      title: '确认删除',
      content: '确定删除此项吗？',
      success(res) {
        if (res.confirm) {
          var newPersonalData = that.data.personal
          
          if (type === 'cities') {
            newPersonalData.cities.splice(index, 1)
          } else if (type === 'stocks') {
            newPersonalData.stocks.splice(index, 1)
          } else if (type === 'constellations') {
            newPersonalData.constellations.splice(index, 1)
          } else if (type === 'menu') {
            newPersonalData.menu.splice(index, 1)
          }
          
          that.setData({
            personal: newPersonalData
          })
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})