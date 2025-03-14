import { createPinia } from 'pinia'
// 引入持久化插件
import { createPersistedState } from 'pinia-plugin-persistedstate'

// 创建store实例
const store = createPinia()
//使用持久化插件
// store.use(createPersistedState())

store.use(
  createPersistedState({
    auto: false //	该配置将会使所有 Store 持久化存储，且必须配置 persist: false 显式禁用持久化。
  })
)
export default store
