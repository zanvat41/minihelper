const app = getApp()

Page({
  data: {
    filesToUpload: [],
    downloadedFiles: [],
    storedFiles: [],
    selectedFiles: []  // MD5 hashes of selected images
  },
  
  chooseImage: function(e){
    var that = this
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      maxDuration: 30,
      camera: 'back',
      success(res) {
        console.log(res.tempFiles[0].tempFilePath)
        console.log(res.tempFiles[0].size)
        var newFiles = that.data.filesToUpload.concat([res.tempFiles[0].tempFilePath])
        that.setData({
          filesToUpload: newFiles
        })
      }
    })
  },

  deleteSelectedImage: function(e){
    var index = e.currentTarget.dataset.index
    var newFiles = this.data.filesToUpload.filter((item, i) => i !== index)
    this.setData({
      filesToUpload: newFiles
    })
  },

  uploadFiles: function(){
    var that = this
    if(this.data.filesToUpload.length == 0) {
      wx.showToast({
        title: '没有选择图片',
        icon: 'error'
      })
      return
    }
    else{
      wx.showToast({
        title: `开始上传 ${this.data.filesToUpload.length} 张图片`,
        icon: 'loading',
        duration: 1000
      })

      var totalFiles = this.data.filesToUpload.length
      var uploadedCount = 0

      for (var i = 0; i < this.data.filesToUpload.length; i++) {
        var filePath = this.data.filesToUpload[i]

        wx.uploadFile({
          filePath: filePath,
          name: filePath + 'test',
          url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/image',
          success(res) {
            console.log(res)
            uploadedCount++
            
            // Check if all files are uploaded
            if (uploadedCount === totalFiles) {
              wx.showToast({
                title: '上传完成',
                icon: 'success'
              })
              
              // Clear the upload queue
              that.setData({
                filesToUpload: []
              })
              
              // Refresh the page to show updated backed up files
              that.refreshPage()
            }
          },
          fail(err) {
            console.error('Upload failed:', err)
            uploadedCount++
            
            // Still check if all files processed (including failures)
            if (uploadedCount === totalFiles) {
              wx.showToast({
                title: '上传完成',
                icon: 'success'
              })
              
              // Clear the upload queue
              that.setData({
                filesToUpload: []
              })
              
              // Refresh the page to show updated backed up files
              that.refreshPage()
            }
          }
        })
      }
    }
  },

  // Download file to downloadedFiles array (for selected files download)
  downloadToFiles: function(md5) {
    var that = this
    console.log(md5 + " to be downloaded")
    wx.downloadFile({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/image?md5=' + md5,
      success(res) {
        var tempPath = res.tempFilePath
        var newFiles = that.data.downloadedFiles.concat([tempPath])
        that.setData({
          downloadedFiles: newFiles
        })
        console.log('Downloaded to files:', tempPath)
      }
    })
  },

  deleteFile: function(options = {}){
    const {
      md5 = null,
    } = options
    var that = this
    if(md5 == null) {
      console.log("no md5")
    } else{
      wx.request({
        url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/image?md5=' + md5,
        method: 'DELETE',
        success(res) {
          console.log(res)
          
          // Remove the deleted image from storedFiles array
          var updatedStoredFiles = that.data.storedFiles.filter(file => file.md5 !== md5)
          
          // Remove from selectedFiles list  
          var updatedSelectedFiles = that.data.selectedFiles.filter(fileMd5 => fileMd5 !== md5)
          
          // Update the UI
          that.setData({
            storedFiles: updatedStoredFiles,
            selectedFiles: updatedSelectedFiles
          })
          
          wx.showToast({
            title: '删除成功'
          })
        },
        fail(err) {
          console.error('Delete failed:', err)
          wx.showToast({
            title: '删除失败',
            icon: 'error'
          })
        }
      })
    }
  },

  downloadSelectedFiles: function() {
    if(this.data.selectedFiles.length == 0) {
      wx.showToast({
        title: '没有选择图片',
        icon: 'error'
      })
      return
    }
    
    wx.showToast({
      title: `开始下载 ${this.data.selectedFiles.length} 张图片`,
      icon: 'loading',
      duration: 1000
    })
    
    for (const md5 of this.data.selectedFiles) {
      console.log("downloading " + md5 + " to downloaded images area")
      this.downloadToFiles(md5)
    }
  },

  deleteFiles: function(){
    if(this.data.selectedFiles.length == 0)
      wx.showToast({
        title: '没有选择图片',
        icon: 'error'
      })
    for (const md5 of this.data.selectedFiles) {
      console.log("deleting " + md5)
      this.deleteFile({ md5: md5 })
    }
  },

  onShow: function() {
    this.refreshPage()
  },

  toggleStoredImageSelection: function(e) {
    var index = e.currentTarget.dataset.index
    var storedFiles = this.data.storedFiles
    storedFiles[index].selected = !storedFiles[index].selected
    
    // Update selectedFiles list
    var selectedFiles = this.data.selectedFiles
    var md5 = storedFiles[index].md5
    
    if (storedFiles[index].selected) {
      // Add to selection list if not already there
      if (selectedFiles.indexOf(md5) === -1) {
        selectedFiles.push(md5)
      }
    } else {
      // Remove from selection list
      var md5Index = selectedFiles.indexOf(md5)
      if (md5Index > -1) {
        selectedFiles.splice(md5Index, 1)
      }
    }
    
    this.setData({
      storedFiles: storedFiles,
      selectedFiles: selectedFiles
    })
    
    console.log('Selected files:', selectedFiles)
  },

  refreshPage: function(){
    this.setData({
      storedFiles: [],
      selectedFiles: [] 
    })
    this.downloadAllBackedUpFiles()
  },

  downloadAllBackedUpFiles: function(){
    var that = this
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/image/list',
      method: 'GET',
      success(res) {
        console.log(res)
        var imgNames = res.data.data.imgNames
        
        // Download each image and add to storedFiles
        for (const imgName of imgNames) {
          console.log("loading " + imgName + " to stored images area")
          wx.downloadFile({
            url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/image?md5=' + imgName,
            success(downloadRes) {
              var tempPath = downloadRes.tempFilePath
              var newFiles = that.data.storedFiles.concat([{
                path: tempPath,
                md5: imgName,
                selected: false
              }])
              that.setData({
                storedFiles: newFiles
              })
            }
          })
        }
        console.log('All images requested:', imgNames)
      }
    })
  },

  longPressConfirm: function(e){
    console.log("long press detected")
    var that = this
    var index = e.currentTarget.dataset.index
    var confirmList = ["删除图片","保存本地"]
    wx.showActionSheet({
      itemList: confirmList,
      success(res) {
        if(res.cancel) {
          return
        } else if(res.tapIndex == 0){
          // tapIndex: 0-删除图片, 1-保存本地
          console.log(res)
          // Remove the selected image from downloadedFiles list
          var newDownloadedFiles = that.data.downloadedFiles.filter((item, i) => i !== index)
          that.setData({
            downloadedFiles: newDownloadedFiles
          })
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
          
          console.log('Removed image from downloaded files, remaining:', newDownloadedFiles.length)
        } else {
          wx.saveImageToPhotosAlbum({
            filePath: that.data.downloadedFiles[index],
            success(res){
              wx.showToast({
                title: '图片已保存',
                icon: 'success'
              })
            },
            fail(res){
              wx.showToast({
                title: '保存失败',
                icon: 'error'
              })
            }
          })
        }
      }
    })
  }
});