// import { ElMessage } from 'element-plus'
import { getItem } from '../utils/localStorage'
import { USER_ID_KEY, getServerInfo, getSelfInfo, NAS_FOLDER_SAVE_PATH } from '../const/user_key'
import { OperationType, BroadcastType } from '../const/enum'
import { useGlobalStore } from '../stores/global'
import { $bus } from '../utils/eventBus'
import { downloadController } from '../controller/DownloadController'
import { UPDATE_UPLOAD_PROGRESS } from '../const/event_name'
import { useUploadListStore } from '../stores/uploadList'
import { loading } from '../views/components/Loading'
import { useServerStateStore } from '../stores/serverState'
import { useConfigStore } from '../stores/config'

const globalStore = useGlobalStore()
const uploadListStore = useUploadListStore()
const serverStateStore = useServerStateStore()
const configStore = useConfigStore()

let ws = null
let heartbeatTimer = null
let reconnectTimer = null
let heartbeatStatus = false

let connectStatus = false

const reconnect = () => {
  reconnectTimer = setTimeout(() => {
    if (ws && ws.readyState === WebSocket.CLOSED && getItem(USER_ID_KEY)) {
      // todo 因为一台电脑上运行了两个Electron程序，导致后起的程序缓存不能用，这里先不做判断
      // if (ws && ws.readyState === WebSocket.CLOSED) {
      console.log('websocket连接断开，正在尝试重连')
      initWebSocket()
    }
  }, 1000)
}

export const initWebSocket = () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log('websocket已连接，不再重新连接')
    return
  }
  ws = new WebSocket(`${configStore.SERVER_ADDR_WS}?userId=${getSelfInfo(true)}`)

  ws.onopen = () => {
    if (!connectStatus) {
      window.api.notification.serverOnlineNotification()
      connectStatus = true
    }

    console.log('websocket连接已打开')
    // 初次链接的时候请求文件列表
    wsSend({ type: OperationType.REQ_FILE_LIST, data: globalStore.currentPath })
    // loading.open() // 去除初次连接时，加载文件列表的loading效果，防止服务器不在线时，导致的loading不消失问题

    // 初次连接发送心跳包，5秒发送一次
    wsSend({ type: BroadcastType.HEARTBEAT, data: 'ping' })
    if (!heartbeatTimer) {
      heartbeatTimer = setInterval(() => {
        wsSend({ type: BroadcastType.HEARTBEAT, data: 'ping' })
        if (heartbeatStatus) {
          console.log('心跳包已发送，服务端未响应')
        } else {
          heartbeatStatus = true
        }
      }, 5000)
    }
  }

  ws.onclose = () => {
    console.log('websocket连接已关闭')
    if (connectStatus) {
      window.api.notification.serverOfflineNotification()
      connectStatus = false
    }

    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }

    reconnect()
  }

  ws.onerror = (err) => {
    console.log('websocket连接发生错误', err)
  }

  ws.onmessage = wsOnMessage
}

const wsOnMessage = async (e) => {
  const msg = JSON.parse(e.data)

  const { dataInfo, selfInfo, targetInfo } = msg

  if (!dataInfo) return

  const { type, data } = dataInfo
  if (type === OperationType.UPLOAD) {
    downloadController.add({ fileInfo: data, savePath: getItem(NAS_FOLDER_SAVE_PATH) })
  } else if (type === OperationType.FILE_LIST) {
    $bus.emit(OperationType.FILE_LIST, data)
  } else if (type === BroadcastType.HEARTBEAT) {
    if (data.data === 'pong') {
      // console.log('心跳包已收到，服务端正常')
      serverStateStore.setServerState(data.mac)
      heartbeatStatus = false
    }
  } else if (type === UPDATE_UPLOAD_PROGRESS) {
    const { uploadPath, status } = data
    uploadListStore.updateStatus({ path: uploadPath, status })
  } else if (type === OperationType.REFRESH) {
    $bus.emit(OperationType.REFRESH)
  } else if (type === OperationType.DOWNLOAD_FILE_IS_EXIST_INFO) {
    $bus.emit(OperationType.DOWNLOAD_FILE_IS_EXIST_INFO, data)
  } else if (type === OperationType.UPLOAD_FILE_IS_EXIST_INFO) {
    $bus.emit(OperationType.UPLOAD_FILE_IS_EXIST_INFO, data)
  }
}

export const wsSend = (dataInfo) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    let jsonData = {
      dataInfo,
      selfInfo: getSelfInfo(),
      targetInfo: dataInfo.type === BroadcastType.HEARTBEAT ? null : getServerInfo()
    }
    jsonData = JSON.stringify(jsonData)

    ws.send(jsonData)
  } else {
    console.log('未连接文件服务器')
  }
}

export const wsClose = () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
    ws.close()
  }
}

// 发送广播，确定有哪些服务端在线
export const broadcastServerOnlineStatus = () => {
  wsSend({ type: OperationType.BROADCAST_SERVER_ONLINE_STATUS })
}
