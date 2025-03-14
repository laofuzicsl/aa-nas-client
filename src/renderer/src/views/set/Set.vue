<template>
  <div class="container">
    <el-main>
      <el-form :model="formState" label-width="150px">
        <el-form-item label="文件服务路径：">
          <div class="form-content">
            <el-input
              style="min-width: 300px"
              v-model="formState.fileServerPath"
              placeholder="请输入文件服务路径"
              disabled
            ></el-input>
            <el-button style="margin-left: 10px" type="primary" plain @click="selectSavePath"
              >选取路径</el-button
            >
          </div>
        </el-form-item>

        <el-form-item label="同时下载数量：">
          <div class="form-content">
            <el-input-number
              @change="
                () => {
                  setItem(MAX_DOWNLOAD_COUNT, formState.maxDownloadCount)
                }
              "
              v-model="formState.maxDownloadCount"
              :min="1"
              :max="5"
            ></el-input-number>
          </div>
        </el-form-item>
      </el-form>
    </el-main>
  </div>
</template>

<script setup>
import { reactive, onMounted, onActivated } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getItem, setItem } from '../../utils/localStorage'
import { NAS_FOLDER_SAVE_PATH, MAX_DOWNLOAD_COUNT } from '../../const/user_key'
import { useRouter } from 'vue-router'
import { useGlobalStore } from '../../stores/global'

const globalStore = useGlobalStore()
onActivated(() => {
  globalStore.setFileListInfo('')
})

const router = useRouter()

const formState = reactive({
  fileServerPath: '',
  maxDownloadCount: 3
})

const selectSavePath = async () => {
  const folderPath = await window.api.getFolderPath()
  if (!folderPath) return
  formState.fileServerPath = folderPath
  setItem(NAS_FOLDER_SAVE_PATH, folderPath)
}

const initSetInfo = async () => {
  formState.fileServerPath = getItem(NAS_FOLDER_SAVE_PATH)
  formState.maxDownloadCount = Number(getItem(MAX_DOWNLOAD_COUNT) || 3)
}

onMounted(async () => {
  initSetInfo()
})
</script>

<style lang="less" scoped>
.container {
  padding: 15px;
  .form-content {
    display: flex;
  }
}
</style>
