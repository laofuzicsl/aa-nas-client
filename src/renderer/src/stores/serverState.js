import { debounce } from 'loadsh'
import { defineStore } from 'pinia'

export const useServerStateStore = defineStore('server-state', {
  state: () => ({
    currentServer: null, // 当前服务端
    stateList: [] // 服务端状态列表
  }),

  actions: {
    setServerState(mac) {
      const item = this.stateList.find((item) => item.mac === mac)
      if (item) {
        item.data = true
        item.timer()
      } else {
        const temp = {
          mac,
          data: true,
          timer: debounce(function () {
            this.data = false
            console.error(this.mac, '已离线')
          }, 1000 * 10)
        }

        if (this.stateList.length === 0) {
          this.currentServer = temp
        }
        this.stateList.push(temp)
        temp.timer()
      }
    },

    getCurrentServer() {
      if (!this.currentServer && this.stateList.length > 0) {
        this.currentServer = this.stateList[0]
      }

      return this.currentServer
    },

    setCurrentServer(mac) {
      this.currentServer = this.stateList.find((item) => item.mac === mac)
    },

    getServerState(mac) {
      if (mac) {
        return this.stateList.find((item) => item.mac === mac)
      }

      return null
    },

    getServerStateList() {
      return this.stateList
    }
  }
})
