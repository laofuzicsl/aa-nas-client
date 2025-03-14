import { defineStore } from 'pinia'
import { Download, DownloadStatus } from '../const/enum'
import { ElMessage } from 'element-plus'

export const useDownloadListStore = defineStore(`download-list-record`, {
  state: () => ({
    downloadList: []
  }),
  actions: {
    add(item) {
      item.status = DownloadStatus.WAITING
      this.downloadList.push(item)
    },

    coverList(list) {
      this.downloadList = list
    },

    remove(path) {
      this.downloadList = this.downloadList.filter((item) => {
        const { fileInfo } = item

        if (fileInfo.path !== path) {
          if (item.status === DownloadStatus.DOWNLOADING) {
            ElMessage.warning('暂不支持清除下载中文件！')
            return true
          }
          return false
        }

        return true
      })
    },
    updateStatus({ path, status, downloadProgress, size, localPath }) {
      this.downloadList = this.downloadList.map((item) => {
        if (item.path === path && localPath) {
          item.localPath = localPath
        }

        if (item.path === path && item.status !== DownloadStatus.DONE) {
          if (status) {
            item.status = status
          }

          if (status === DownloadStatus.DONE) {
            item.downloadProgress = '100%'
          } else if (downloadProgress) {
            item.downloadProgress = downloadProgress
          }
        }
        return item
      })
    },
    // 获取正在进行中的数量
    hasInProgress() {
      return (
        this.downloadList.filter(
          (item) => !(item.status === DownloadStatus.FAIL || item.status === DownloadStatus.DONE)
        ).length > 0
      )
    }
  }
})
