import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { router } from './router/index.js'
import store from './stores/index.js'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './utils/console.js'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(ElementPlus)
app.use(router)
app.use(store)

app.mount('#app')
