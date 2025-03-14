import http from './http'
import { useConfigStore } from '../stores/config'

const configStroe = useConfigStore()

class Login {
  // 登录接口
  login(param) {
    return http.post(`${configStroe.SERVER_ADDR}/user/login`, param)
  }

  register(param) {
    return http.post(`${configStroe.SERVER_ADDR}/user/register`, param)
  }

  getVerifyCode(param) {
    return http.post(`${configStroe.SERVER_ADDR}/user/getVerifyCode`, param)
  }
}

export const loginHttp = new Login()
