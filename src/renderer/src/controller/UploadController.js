import { getSelfInfo, getServerInfo } from '../const/user_key'
import { UploadStatus } from '../const/enum'
import { useUploadListStore } from '../stores/uploadList'
import { UPDATE_DOWNLOAD_PROGRESS } from '../const/event_name'
import { useGlobalStore } from '../stores/global'

const uploadListStore = useUploadListStore()
const globalStore = useGlobalStore()

/**
 * @description 下载管理类
 * 负责文件下载管理和状态更新
 */

class UploadController {
  constructor() {
    this.reserveList = [] // 预备下载列表
    this.uploadingList = new Map() // 正在下载列表

    // 监听下载进度的消息
    window.api.message((message) => {
      const { type, data } = message

      if (type === UPDATE_DOWNLOAD_PROGRESS) {
        uploadListStore.updateStatus({
          path: data.filePath,
          status: data.data
        })
      }
    })
  }

  // 添加下载任务
  add(item) {
    this.reserveList.push(item)
    const { path, size } = item

    uploadListStore.add(item)

    // 触发下载动作
    if (this.reserveList.length > 0) {
      this.start()
    }
  }

  // 删除下载任务
  delete(fileInfo) {}

  // 启动下载进程
  start() {
    const maxDownloadCount = 10

    while (this.uploadingList.size < maxDownloadCount && this.reserveList.length > 0) {
      const item = this.reserveList.shift()
      const { savePath, path } = item
      this.uploadingList.set(path, item)

      uploadListStore.updateStatus({
        path,
        status: UploadStatus.UPLOADING
      })
      window.api
        .uploadFile({
          path,
          savePath,
          selfInfo: getSelfInfo(true),
          targetInfo: getServerInfo(true),
          serverCurrentPath: globalStore.currentPath
        })
        .then((res) => {
          uploadListStore.updateStatus({ path, status: UploadStatus.DONE1 })
        })
        .catch((err) => {
          uploadListStore.updateStatus({ path, status: UploadStatus.FAIL })
        })
        .finally(() => {
          this.uploadingList.delete(path)
          this.start()
        })
    }
  }
}

export const uploadController = new UploadController()
