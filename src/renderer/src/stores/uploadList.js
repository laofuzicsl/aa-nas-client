import { defineStore } from 'pinia'
import { UploadStatus } from '../const/enum'
import { ElMessage } from 'element-plus'

export const useUploadListStore = defineStore(`upload-list-record`, {
  state: () => ({
    uploadList: []
  }),
  actions: {
    add(item) {
      item.status = UploadStatus.WAITING
      this.uploadList.push(item)
      // console.log('添加了一条上传数据', item, this.uploadList.length)
    },

    coverList(list) {
      this.uploadList = list
    },

    remove(path) {
      this.uploadList = this.uploadList.filter((item) => {
        const { fileInfo } = item

        if (fileInfo.path !== path) {
          if (item.status === UploadStatus.DOWNLOADING) {
            ElMessage.warning('暂不支持清除上传中的文件！')
            return true
          }
          return false
        }

        return true
      })
    },
    updateStatus({ path, status }) {
      this.uploadList = this.uploadList.map((item) => {
        if (
          item.path === path &&
          (item.status !== UploadStatus.DONE3 || status === UploadStatus.FAIL)
        ) {
          if (status) {
            item.status = status
          }
        }
        return item
      })
    },

    // 获取正在进行中的数量
    hasInProgress() {
      return (
        this.uploadList.filter(
          (item) => !(item.status === UploadStatus.FAIL || item.status === UploadStatus.DONE3)
        ).length > 0
      )
    }
  }
})
