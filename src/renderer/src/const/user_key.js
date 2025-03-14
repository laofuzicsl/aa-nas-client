import { getItem } from '../utils/localStorage'
import { DeviceType } from './enum'
import { useGlobalStore } from '../stores/global'
import { useServerStateStore } from '../stores/serverState'

// token的key值
export const TOKEN_KEY = 'file-serves-token'

// 用户id的key值
export const USER_ID_KEY = 'file-serves-user-id'

// 用户名的key值
export const USER_NAME_KEY = 'file-serves-user-name'

// 数据的保存路径key值
export const NAS_FOLDER_SAVE_PATH = 'file-serves-nas-folder-save-path'
// 同时下载数量
export const MAX_DOWNLOAD_COUNT = 'file-serves-max-download-count'

// const USER_ID_VALUE = `cee2e7e7-b89b-4624-98a7-63bf22375c64`

export const getUserId = () => getItem(USER_ID_KEY)

const globalStore = useGlobalStore()
const serverStateStore = useServerStateStore()

// 获取自身的websocket的key
export const getSelfInfo = (isString = false) => {
  let res = {
    userId: getUserId(),
    deviceType: DeviceType.CLIENT,
    deviceModel: 'PC',
    mac: globalStore.macAddress
  }
  if (isString) {
    res = JSON.stringify(res)
  }

  return res
}

export const getServerInfo = (isString = false) => {
  let res = {
    userId: getUserId(),
    deviceType: DeviceType.SERVER,
    deviceModel: 'PC',
    mac: serverStateStore.getCurrentServer()?.mac
  }
  if (isString) {
    res = JSON.stringify(res)
  }

  return res
}
