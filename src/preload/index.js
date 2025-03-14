import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  WINDOW_MAX,
  WINDOW_UNMAX,
  STARTUP_PARAMETERS,
  UPDATE_DOWNLOAD_PROGRESS,
  UPDATE_UPLOAD_PROGRESS
} from '../renderer/src/const/event_name'

// 渲染器的定制api
const api = {
  /**
   * 充当消息中间件
   */
  message: (callback) => {
    // ipcRenderer.on(WINDOW_MAX, (param, message) => callback({ type: WINDOW_MAX, data: null }))
    // ipcRenderer.on(WINDOW_UNMAX, (param, message) => callback({ type: WINDOW_UNMAX, data: null }))
    // ipcRenderer.on(STARTUP_PARAMETERS, (param, message) =>
    //   callback({ type: STARTUP_PARAMETERS, data: message })
    // )
    ipcRenderer.on(UPDATE_DOWNLOAD_PROGRESS, (param, message) =>
      callback({ type: UPDATE_DOWNLOAD_PROGRESS, data: message })
    )
    ipcRenderer.on(UPDATE_UPLOAD_PROGRESS, (param, message) =>
      callback({ type: UPDATE_UPLOAD_PROGRESS, data: message })
    )
  },
  notification: {
    serverOfflineNotification: () => ipcRenderer.invoke('serverOfflineNotification'), // 服务器离线通知
    serverOnlineNotification: () => ipcRenderer.invoke('serverOnlineNotification') // 服务器在线通知
  },
  openDir: (path) => ipcRenderer.invoke('openDir', path), // 获取文件夹目录下的所有文件
  getFilePathByAbsolutePath: (path) => ipcRenderer.invoke('getFilePathByAbsolutePath', path), // 根据文件绝对路径，获取文件路径
  downloadFile: (data) => ipcRenderer.invoke('downloadFile', data), // 下载文件
  getFile: (data) => ipcRenderer.invoke('getFile', data), // 打开文件选择框
  regroupUploadFileInfo: (data) => ipcRenderer.invoke('regroupUploadFileInfo', data), // 将选中的要上传的文件信息进行重组
  getFolderPath: () => ipcRenderer.invoke('getFolderPath'), // 获取文件夹路径
  getLargestFreeSpacePartitionWindows: () =>
    ipcRenderer.invoke('getLargestFreeSpacePartitionWindows'), // 获取windows下最大的可用磁盘空间
  joinPath: (data) => ipcRenderer.invoke('joinPath', data), // 拼接路径
  checkFileExistSync: (data) => ipcRenderer.invoke('checkFileExistSync', data), // 检查文件是否存在
  getMacAddress: () => ipcRenderer.invoke('getMacAddress'), // 获取mac地址
  uploadFile: (data) => ipcRenderer.invoke('uploadFile', data), // 上传文件
  openFolder: (path) => ipcRenderer.invoke('openFolder', { path }), // 打开文件夹

  // 配置文件相关
  readConfig: () => ipcRenderer.invoke('readConfig'), // 读取配置文件
  writeConfig: (data) => ipcRenderer.invoke('writeConfig', data), // 写入配置文件
  getAddress: () => ipcRenderer.invoke('getAddress') // 获取服务器地址
}

// 使用'contextBridge' api只在启用上下文隔离的情况下将Electron api暴露给渲染器，否则只添加到DOM全局。
if (process.contextIsolated) {
  try {
    // contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // window.electron = electronAPI
  window.api = api
}
