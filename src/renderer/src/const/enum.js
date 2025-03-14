// 客户端类型
const DeviceType = {
  CLIENT: 'client',
  SERVER: 'server'
}

const OperationType = {
  DELETE: 'delete',
  UPLOAD: 'upload',
  DOWNLOAD: 'download',
  REQ_FILE_LIST: 'getFileList',
  FILE_LIST: 'fileList',
  REFRESH: 'refresh',
  CLEAR_FILE_LIST: 'clearFileList',
  CREATE_FOLDER: 'createFolder',
  DOWNLOAD_FILE_IS_EXIST: 'downloadFileIsExist', // 获取文件到另一端时的保存路径的信息
  DOWNLOAD_FILE_IS_EXIST_INFO: 'downloadFileIsExistInfo',
  UPLOAD_FILE_IS_EXIST: 'uploadFileIsExist', // 上传文件到另一端时文件是否已经存在的信息
  UPLOAD_FILE_IS_EXIST_INFO: 'uploadFileIsExistInfo'
}

const Download = {
  ADD_FILE: 'addFile', // 添加下载文件
  REMOVE_FILE: 'removeFile', // 移除下载文件
  START_DOWNLOAD: 'startDownload', // 开始下载
  STOP_DOWNLOAD: 'stopDownload', // 停止下载
  DONE_DOWNLOAD: 'doneDownload' // 下载完成
}

const DownloadStatus = {
  WAITING: '等待下载', // 等待下载
  DOWNLOADING: '下载中', // 正在下载
  DONE: '下载完成', // 下载完成
  FAIL: '下载失败', // 下载出错
  PAUSE: '暂停' // 暂停
}

const UploadStatus = {
  WAITING: '等待上传', // 等待上传
  UPLOADING: '上传中', // 上传中
  DONE1: '等待服务端下载', // 上传完成
  DONE2: '服务端下载中', // 上传完成
  DONE3: '上传完成', // 上传完成
  FAIL: '上传失败' // 上传出错
}

// 广播
const BroadcastType = {
  HEARTBEAT: 'heartbeat' // 心跳
}

export { DeviceType, OperationType, Download, DownloadStatus, UploadStatus, BroadcastType }
