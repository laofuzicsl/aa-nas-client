import axios, { AxiosHeaders } from 'axios'
import { ElMessage } from 'element-plus'
import { TOKEN_KEY } from '../const/user_key'

const instance = axios.create()

const err = (error) => {
  // 断网了
  if (error?.response?.status === undefined && window.navigator.onLine === false) {
    ElMessage.error('网络中断，请检查网络')
    return Promise.reject('网络中断，请检查网络')
  }

  // 没断网
  if (error?.response?.status === 401) {
    // token 失效，刷新子应用---父应用也会刷新，父应用就会调用接口，父应用接口 401，然后父应用就会清除 token，访问登录页
    // window.location.href = window.location.origin
    window.logoutSystem && window.logoutSystem()
    return Promise.reject(error?.response || '网络请求异常')
  } else if (error?.response?.status === 403) {
    // 主应用里面的几个接口，如 menu、user等后端没有 403 的逻辑
    console.log('======拦截器 response=====', error)
    ElMessage.error('您无本操作的权限！')
    return Promise.reject({
      statusText: '您无本操作的权限！'
    })
  } else if (error?.response?.status === 302 || error?.response?.status === undefined) {
    console.log('======拦截器 response=====', error)
    if (error?.message?.includes('timeout') && error?.code === 'ECONNABORTED') {
      ElMessage.error(`${error?.config?.url} 接口请求超时，请稍后刷新重试！`)
    } else {
      ElMessage.error(`请求失败`)
    }
    return Promise.reject({
      statusText: '重定向到登录页/网络异常'
    })
  } else {
    console.log('======拦截器 response=====', error)
    ElMessage.error(`网络请求异常，http code = ${error?.response?.status}`)
    return Promise.reject(error?.response || '网络请求异常')
  }
}

// 请求拦截器
instance.interceptors.request.use((config) => {
  const token = window.localStorage.getItem(TOKEN_KEY)

  // 放在 if 里面，是为了防止登录接口，虽然没有 token，但是还是加入了一个空的 Authorization，这样后端接口会报错
  if (token) {
    // 在请求 header 部分添加 token
    config.headers.set('Authorization', token)
  }

  return config
}, err)

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    const { data } = response
    return data
  },
  (error) => {
    if (axios.isCancel(error)) {
      console.log('取消的请求======', error)

      return Promise.reject(error)
    } else {
      return err(error)
    }
  }
)

const http = {
  get(url, params) {
    return new Promise((resolve, reject) => {
      instance
        .get(url, { params })
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          reject(err?.statusText)
        })
    })
  },
  post(url, params, headers) {
    return new Promise((resolve, reject) => {
      instance
        .post(url, params, headers)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          reject(err?.statusText)
        })
    })
  },
  put(url, params, headers) {
    return new Promise((resolve, reject) => {
      instance
        .put(url, params, headers)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          reject(err?.statusText)
        })
    })
  },
  upload(url, file) {
    return new Promise((resolve, reject) => {
      instance
        .post(url, file, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then((res) => {
          resolve(res.data)
        })
        .catch((err) => {
          reject(err?.statusText)
        })
    })
  },
  delete(url, params) {
    return new Promise((resolve, reject) => {
      instance
        .delete(url, { params })
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          reject(err?.statusText)
        })
    })
  }
}

export default http
