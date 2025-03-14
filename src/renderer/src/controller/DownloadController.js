import { MAX_DOWNLOAD_COUNT, NAS_FOLDER_SAVE_PATH } from '../const/user_key'
import { Download, DownloadStatus } from '../const/enum'
import { $bus } from '../utils/eventBus'
import { getItem } from '../utils/localStorage'
import { useDownloadListStore } from '../stores/downloadList'
import { UPDATE_DOWNLOAD_PROGRESS } from '../const/event_name'

const downloadListStore = useDownloadListStore()

/**
 * @description 下载管理类
 * 负责文件下载管理和状态更新
 */

class DownloadController {
  constructor() {
    this.reserveList = [] // 预备下载列表
    this.downloadingList = new Map() // 正在下载列表

    // 监听下载进度的消息
    window.api.message((message) => {
      const { type, data } = message

      if (type === UPDATE_DOWNLOAD_PROGRESS) {
        downloadListStore.updateStatus({
          path: data.filePath,
          downloadProgress: data.data
        })
      }
    })
  }

  // 添加下载任务
  add(item) {
    this.reserveList.push(item)
    const { fileInfo } = item
    downloadListStore.updateStatus({
      path: fileInfo.filePath,
      status: DownloadStatus.WAITING,
      downloadProgress: '0%',
      size: fileInfo.size
    })
    // 触发下载动作
    if (this.reserveList.length > 0) {
      this.start()
    }
  }

  // 删除下载任务
  delete(fileInfo) {}

  // 启动下载进程
  start() {
    const maxDownloadCount = Number(getItem(MAX_DOWNLOAD_COUNT))

    while (this.downloadingList.size < maxDownloadCount && this.reserveList.length > 0) {
      const item = this.reserveList.shift()
      const { fileInfo } = item
      // console.log('开始下载：', item)
      this.downloadingList.set(fileInfo.filePath, item)
      downloadListStore.updateStatus({
        path: fileInfo.filePath,
        status: DownloadStatus.DOWNLOADING
      })

      window.api
        .downloadFile(item)
        .then((res) => {
          downloadListStore.updateStatus({
            path: fileInfo.filePath,
            status: res.result ? DownloadStatus.DONE : DownloadStatus.FAIL,
            localPath: res.path
          })
        })
        .catch((err) => {
          console.log('下载失败：', err)
          downloadListStore.updateStatus({ path: fileInfo.filePath, status: DownloadStatus.FAIL })
        })
        .finally(() => {
          // 不管成功还是失败都将该文件从正在下载列表中删除
          this.downloadingList.delete(fileInfo.filePath)
          this.start()
        })
    }
  }
}

export const downloadController = new DownloadController()
