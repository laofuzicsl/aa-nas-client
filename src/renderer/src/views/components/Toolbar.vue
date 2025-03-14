<template>
  <div class="container">
    <div class="left-container">
      <el-dropdown placement="top" trigger="click">
        <div class="user-avatar">
          <el-icon><Avatar /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <!-- <el-dropdown-item>个人中心</el-dropdown-item> -->
            <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <div class="user-name">{{ globalStore.userInfo.userName || getItem(USER_NAME_KEY) }}</div>
    </div>

    <div class="right-container">
      <div class="file-list-statistics">{{ globalStore.fileListInfo }}</div>

      <el-popover ref="popoverRef" trigger="click" width="177">
        <template #reference>
          <div class="status" title="点击切换服务端">
            <div class="desc">
              {{ serverStateStore.currentServer ? serverStateStore.currentServer.mac : '-' }}
            </div>
            <div
              :class="{
                icon: true,
                'online-icon': serverStateStore.currentServer
                  ? serverStateStore.currentServer.data
                  : false
              }"
            ></div>
          </div>
        </template>
        <div class="toolbar-popover-server-list">
          <div
            v-for="(item, index) in serverStateStore.stateList"
            :key="index"
            class="row"
            @click="clickServerStateRow(item.mac)"
          >
            <span>{{ item.mac }}</span>
            <div
              :class="{
                icon: true,
                'online-icon': item.data
              }"
            ></div>
          </div>
        </div>
      </el-popover>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGlobalStore } from '../../stores/global'
import { setItem, getItem, removeItem } from '../../utils/localStorage'
import { TOKEN_KEY, USER_ID_KEY, USER_NAME_KEY } from '../../const/user_key'
import { Avatar } from '@element-plus/icons-vue'
import { wsClose } from '../../api/websocket'
import { $bus } from '../../utils/eventBus'
import { OperationType } from '../../const/enum'
import { useServerStateStore } from '../../stores/serverState'
import { useUploadListStore } from '../../stores/uploadList'
import { useDownloadListStore } from '../../stores/downloadList'
import { ElMessage } from 'element-plus'

const router = useRouter()
const globalStore = useGlobalStore()
const serverStateStore = useServerStateStore()
const uploadListStore = useUploadListStore()
const downloadListStore = useDownloadListStore()

const popoverRef = ref()

const logout = () => {
  // 移除缓存信息
  globalStore.setUserInfo({})
  removeItem(USER_NAME_KEY)
  removeItem(USER_ID_KEY)
  removeItem(TOKEN_KEY)
  // 断开websocket连接
  wsClose()
  // 清空文件列表
  $bus.emit(OperationType.CLEAR_FILE_LIST)
  // 跳转到登录页面
  router.push('/login')
}

const clickServerStateRow = (mac) => {
  popoverRef.value.hide()

  if (uploadListStore.hasInProgress() || downloadListStore.hasInProgress()) {
    ElMessage.warning('有文件正在上传或下载，请稍后再切换服务器!')
    return
  }

  // 切换服务端时，需要检查有没有正在上传和下载的文件，避免通讯出问题
  serverStateStore.setCurrentServer(mac)
  console.log('切换服务器', mac)
}
</script>

<style lang="less" scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #ffffff;
  width: 100%;
  padding-left: 15px;
  padding-right: 15px;
  font-size: 14px;
  .left-container {
    display: flex;
    align-items: center;
    .user-avatar {
      width: 24px;
      height: 24px;
      border-radius: 12px;
      background-color: burlywood;
      margin-right: 10px;
      text-align: center;
      line-height: 25px;
    }
    .user-name {
      line-height: 30px;
    }
  }
  .right-container {
    display: flex;
    align-items: center;
    .file-list-statistics {
      margin-right: 10px;
      font-size: 14px;
    }
    .status {
      cursor: pointer;
      display: flex;
      align-items: center;
      margin-left: 10px;
      .desc {
        line-height: 30px;
      }
      .icon {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: red;
        margin-left: 6px;
      }
      .online-icon {
        background-color: green;
      }
    }
  }
}
</style>

<style lang="less">
.toolbar-popover-server-list {
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 30px;
    padding: 0 8px;
    cursor: pointer;
    &:hover {
      background-color: #ecf5ff;
    }
    .icon {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: red;
      margin-left: 6px;
    }
    .online-icon {
      background-color: green;
    }
  }
}
</style>
