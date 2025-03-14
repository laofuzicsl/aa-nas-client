<template>
  <div class="container">
    <!-- <router-link to="/">
      <el-button type="primary">首页</el-button>
    </router-link> -->

    <div class="content">
      <div class="content-main">
        <el-form :model="fromUser" label-width="60px">
          <el-form-item label="用户名">
            <el-input placeholder="用户名" v-model="fromUser.userName" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input
              placeholder="密码"
              v-model="fromUser.password"
              type="password"
              show-password
            />
          </el-form-item>
        </el-form>
        <el-button class="reset-btn" type="plain" link @click="clickResetPassword"
          >忘记密码？</el-button
        >
      </div>
      <div class="content-footer">
        <el-row justify="center">
          <el-button class="login-btn" type="primary" plain @click="clickLogin">登录</el-button>
        </el-row>
        <el-row justify="center">
          <el-button class="register-btn" type="primary" link @click="clickRegister"
            >注册</el-button
          >
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { loginHttp } from '../../api/user'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { TOKEN_KEY, USER_ID_KEY, USER_NAME_KEY } from '../../const/user_key'
import { initWebSocket } from '../../api/websocket'
import { setItem } from '../../utils/localStorage'
import { useGlobalStore } from '../../stores/global'

const globalStore = useGlobalStore()

const router = useRouter()

const fromUser = reactive({
  userName: '',
  password: ''
})

const clickLogin = () => {
  loginHttp.login(fromUser).then((res) => {
    const { code, token, data, msg } = res
    if (code === 200) {
      const { userName, userId } = data
      console.log('用户ID', userId)
      globalStore.setUserInfo(data)
      ElMessage.success('登录成功')
      setItem(TOKEN_KEY, token)
      setItem(USER_ID_KEY, userId)
      setItem(USER_NAME_KEY, userName)

      router.push({ path: '/', query: {} })

      initWebSocket(data)
    } else {
      ElMessage.error(msg || '登录成功')
    }
  })
}

// 注册
const clickRegister = () => {
  router.push({ path: '/register' })
}

// 重置密码
const clickResetPassword = () => {
  ElMessage.warning('重置密码功能正在开发中...')
}
</script>

<style lang="less" scoped>
.container {
  .content {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border: 1px solid rgba(0, 0, 0, 0.2);
    width: 300px;
    padding: 30px;
    border-radius: 7px;
    .content-main {
      position: relative;
      .reset-btn {
        position: absolute;
        right: -10px;
        bottom: -30px;
        font-size: 14px;
      }
    }
    .content-footer {
      margin-top: 40px;
      text-align: center;
      .el-row {
        margin-top: 10px;
      }
      .login-btn {
        width: 100px;
      }
    }
  }
}
</style>
