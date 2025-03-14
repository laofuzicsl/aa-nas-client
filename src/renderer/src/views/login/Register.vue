<template>
  <div class="container">
    <div class="content">
      <div class="content-main">
        <el-form ref="formRef" :model="fromUser" label-width="80px" :rules="rules">
          <el-form-item label="用户名" prop="userName">
            <el-input placeholder="手机号码" :maxlength="11" v-model="fromUser.userName" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              placeholder="密码"
              v-model="fromUser.password"
              type="password"
              show-password
            />
          </el-form-item>
          <el-form-item label="密码确认" prop="confirmPassword">
            <el-input
              placeholder="再次输入密码"
              v-model="fromUser.confirmPassword"
              type="password"
              show-password
            />
          </el-form-item>
          <el-form-item label="验证码" prop="verifyCode">
            <el-input
              style="width: 50%"
              placeholder="验证码"
              :minlength="6"
              :maxlength="6"
              v-model="fromUser.verifyCode"
            />
            <el-button style="margin-left: 10px" size="small" @click="getVerifyCode"
              >发送验证码</el-button
            >
          </el-form-item>
        </el-form>
        <el-button class="reset-btn" type="plain" link @click="goToLogin"
          >已有账号，去登录</el-button
        >
      </div>
      <div class="content-footer">
        <el-row justify="center">
          <el-button class="login-btn" type="primary" plain @click="clickRegister">注册</el-button>
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
import { validatePassword, validatePhoneNumber } from '../../utils'

const globalStore = useGlobalStore()

const router = useRouter()

const formRef = ref(null)

const fromUser = reactive({
  userName: '',
  password: '',
  confirmPassword: '',
  verifyCode: ''
})

const goToLogin = () => {
  router.push({ path: '/login' })
}

const getVerifyCode = () => {
  if (!fromUser.userName) {
    ElMessage.warning('请输入手机号')
    return
  }

  const params = {
    userName: fromUser.userName
  }

  loginHttp.getVerifyCode(params).then((res) => {
    const { code, data } = res
    if (code === 200) {
      ElMessage.success(data)
    } else {
      ElMessage.warning(data)
    }
  })
}

const rules = reactive({
  userName: [
    {
      required: true,
      validator: (rule, value, callback) => {
        if (value === '' || value.length !== 11) {
          callback(new Error('请输入手机号'))
        }

        if (!validatePhoneNumber(value)) {
          callback(new Error('手机号码格式错误'))
        }
        callback()
      },
      trigger: ['blur', 'change']
    }
  ],
  password: [
    {
      required: true,
      validator: (rule, value, callback) => {
        if (value === '' || value.length < 6) {
          callback(new Error('字母和数字的组合，长度至少为6位'))
        }

        if (!validatePassword(value)) {
          callback(new Error('密码中只能包含字母和数字'))
        }
        callback()
      },
      trigger: ['blur', 'change']
    }
  ],
  confirmPassword: [
    {
      required: true,
      validator: (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'))
        }

        if (value !== fromUser.password) {
          callback(new Error('两次输入的密码不一致'))
        }

        callback()
      },
      trigger: ['blur']
    }
  ],
  verifyCode: [
    {
      required: true,
      validator: (rule, value, callback) => {
        if (value === '' || value.length !== 6) {
          callback(new Error('请输入6位数字验证码'))
        }

        callback()
      },
      trigger: ['blur']
    }
  ]
})

const clickRegister = async () => {
  // if (!checkData()) return

  const vRes = await formRef.value.validate()
  if (!vRes) return

  loginHttp.register(fromUser).then((res) => {
    const { code, token, data, msg } = res
    if (code === 200) {
      ElMessage.success('注册成功')
      router.push({ path: '/login', query: {} })
    } else {
      ElMessage.error(msg || '登录成功')
    }
  })
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
        right: -5px;
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
