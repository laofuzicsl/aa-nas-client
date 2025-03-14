import { defineStore } from 'pinia'

export const useGlobalStore = defineStore(`global-var`, {
  state: () => ({
    currentPath: '', // 当前所在文件夹
    currentFileList: [], // 当前文件夹下的文件
    userInfo: {}, // 用户信息,
    fileListInfo: '', // 文件列表信息
    macAddress: '' // mac地址
  }),
  actions: {
    setCurrentPath(path) {
      this.currentPath = path
    },

    setCurrentFileList(list) {
      this.currentFileList = list
    },

    setUserInfo(info) {
      this.userInfo = info
    },

    setFileListInfo(info) {
      this.fileListInfo = info
    },

    setMacAddress(mac) {
      this.macAddress = mac
    }
  }
})
