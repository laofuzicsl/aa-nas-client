import { defineStore } from 'pinia'

export const useConfigStore = defineStore(`config-var`, {
  state: () => ({
    serverIP: '',
    SERVER_ADDR: '',
    SERVER_ADDR_WS: ''
  }),
  actions: {
    setServerIP(addr) {
      this.serverIP = addr
    },
    setServerAddr(addr) {
      this.SERVER_ADDR = addr
    },
    setServerAddrWs(addr) {
      this.SERVER_ADDR_WS = addr
    }
  }
})
