<template>
  <div class="main">
    <div class="main-top">
      <div class="main-top-left">
        <div class="menu">
          <el-menu :router="true" default-active="File">
            <el-menu-item v-for="item in menus" :key="item.index" :index="item.index">
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.title }}</span>
            </el-menu-item>
          </el-menu>
        </div>
      </div>
      <div class="main-top-right">
        <router-view v-slot="{ Component }"
          ><keep-alive> <component :is="Component"></component> </keep-alive
        ></router-view>
      </div>
    </div>
    <div class="toolbar">
      <Toolbar></Toolbar>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated } from 'vue'
import { FOLDER_KEY } from '../const/file_type'
import { useRouter } from 'vue-router'
import { getItem, setItem } from '../utils/localStorage'
import { MAX_DOWNLOAD_COUNT, NAS_FOLDER_SAVE_PATH, USER_ID_KEY } from '../const/user_key'
import { initWebSocket, wsSend } from '../api/websocket'
import { useGlobalStore } from '../stores/global'
import { OperationType } from '../const/enum'
import Toolbar from './components/Toolbar.vue'
import { Files, Download, Upload, Share, Setting } from '@element-plus/icons-vue'
import { useConfigStore } from '../stores/config'

const menus = [
  { title: '文件库', index: 'File', icon: Files },
  { title: '下载列表', index: 'Download', icon: Download },
  { title: '上传列表', index: 'Upload', icon: Upload },
  // { title: '分享列表', index: 'Share', icon: Share },
  { title: '设置', index: 'Set', icon: Setting }
]

const globalStore = useGlobalStore()
const configStore = useConfigStore()

const router = useRouter()

// 如果一些必要的参数不存在时，在页面加载完成后进行初始化
const initBaseInfo = async () => {
  const addressInfo = await window.api.getAddress()
  if (addressInfo) {
    configStore.setServerIP(addressInfo.SERVER_IP)
    configStore.setServerAddr(addressInfo.SERVER_ADDR)
    configStore.setServerAddrWs(addressInfo.SERVER_ADDR_WS)
  }
  // 初始化保存文件夹路径信息
  let folderPath = getItem(NAS_FOLDER_SAVE_PATH)
  if (!folderPath) {
    const res = await window.api.getLargestFreeSpacePartitionWindows()
    console.log(
      `在 Windows 系统下，剩余空间最大的分区是：${res.drive}，剩余空间为 ${res.freeSpace / 1024 / 1024 / 1024} GB。`
    )
    folderPath = res.drive
  }
  setItem(NAS_FOLDER_SAVE_PATH, folderPath)

  const maxDownloadCount = getItem(MAX_DOWNLOAD_COUNT)
  if (!maxDownloadCount) {
    setItem(MAX_DOWNLOAD_COUNT, 3)
  }

  // 获取Mac地址
  const macAddress = await window.api.getMacAddress()
  console.log(`本机mac地址为：${macAddress}`)
  globalStore.setMacAddress(macAddress)
}

onMounted(async () => {
  await initBaseInfo()

  const userId = getItem(USER_ID_KEY)
  if (userId) {
    initWebSocket(userId)
  } else {
    // 跳转到登录页面
    router.push('/login')
  }
})
</script>

<style lang="less" scoped>
.main {
  width: 100vw;
  height: 100vh;
  .main-top {
    display: flex;
    height: calc(100% - 30px);
    .main-top-left {
      width: 150px;
      height: 100%;
      border-right: 1px solid #dcdfe6;
      :deep .el-menu {
        border-right: none;
      }
    }
    .main-top-right {
      width: calc(100% - 150px);
      // height: calc(100% - 30px);
      // padding: 15px;
      // background-color: #dcdfe6;
    }
  }

  .toolbar {
    background-color: #67c23a;
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 30px;
    display: flex;
    align-items: center;
  }
}
</style>
