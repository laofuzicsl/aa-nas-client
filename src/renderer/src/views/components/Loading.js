import { ElLoading } from 'element-plus'
import { useGlobalStore } from '../../stores/global'
import { useServerStateStore } from '../../stores/serverState'
const globalStore = useGlobalStore()
const serverStateStore = useServerStateStore()
class Loading {
  constructor() {
    this.loading = null
    this.timer = null
  }

  open() {
    if (!serverStateStore.currentServer?.data) {
      console.log('服务器未连接，不显示加载中...')
      return
    }
    this.loading = ElLoading.service({
      lock: true,
      text: '加载中...'
    })

    // 如果30秒后还没加载完成，则自动关闭loading
    this._startTimer()
  }

  close() {
    if (this.loading) {
      this.loading.close()
      this.loading = null
      this._endTimer()
    }
  }

  _startTimer() {
    this.timer = setTimeout(() => {
      this.close()
    }, 1000 * 60)
  }

  _endTimer() {
    try {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    } catch (error) {
      this.timer = null
    }
  }
}

const loading = new Loading()

export { loading }
