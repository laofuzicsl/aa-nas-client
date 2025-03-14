import { KeepAlive } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Main',
    meta: { keepAlive: true },
    component: () => import('../views/Main.vue'),
    redirect: '/file',
    children: [
      {
        path: '/file',
        name: 'File',
        component: () => import('../views/file/File.vue'),
        meta: { keepAlive: true }
      },
      {
        path: '/download',
        name: 'Download',
        component: () => import('../views/download/Download.vue'),
        meta: { keepAlive: true }
      },
      {
        path: '/upload',
        name: 'Upload',
        component: () => import('../views/upload/Upload.vue'),
        meta: { keepAlive: true }
      },
      {
        path: '/share',
        name: 'Share',
        component: () => import('../views/share/Share.vue'),
        meta: { keepAlive: true }
      },
      {
        path: '/set',
        name: 'Set',
        component: () => import('../views/set/Set.vue'),
        meta: { keepAlive: true }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/login/Register.vue')
  }
]

export const router = createRouter({
  history: createWebHashHistory(), // electron-vite框架中只能使用哈希路由，否则打包后无法运行
  routes
})
