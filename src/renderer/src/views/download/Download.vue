<template>
  <div class="container">
    <div class="toolbar">
      <el-button size="small" @click="clearDone">清除已完成</el-button>
    </div>
    <div class="file-list">
      <el-table ref="tableRef" :data="downloadList" style="width: 100%" height="100%">
        <el-table-column label="文件名">
          <template #default="{ row }">
            <div style="display: flex; align-items: center">
              <el-text style="margin-left: 10px">{{ row.originalName }}</el-text>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="文件大小" align="left" width="100">
          <template #default="{ row }"> {{ row.size }}</template>
        </el-table-column>
        <el-table-column label="下载进度" align="left" width="100">
          <template #default="{ row }"> {{ row.downloadProgress }}</template>
        </el-table-column>
        <el-table-column label="下载状态" align="left" width="100">
          <template #default="{ row }">
            <div
              :class="{
                'done-status': row.status === DownloadStatus.DONE,
                'fail-status': row.status === DownloadStatus.FAIL
              }"
            >
              {{ row.status }}
            </div></template
          >
        </el-table-column>
        <el-table-column label="操作" align="left" width="70">
          <template #default="{ row }">
            <div v-if="row.localPath" class="open-folder-btn" @click="openLocalPath(row.localPath)">
              <el-icon :size="16" title="在文件资源管理器中显示"><FolderOpened /></el-icon>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onActivated, onDeactivated, toRaw } from 'vue'
import { Download, DownloadStatus } from '../../const/enum'
import { $bus } from '../../utils/eventBus'
import { useDownloadListStore } from '../../stores/downloadList'
import { useGlobalStore } from '../../stores/global'
import { FolderOpened } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const downloadList = ref([])

const globalStore = useGlobalStore()
const downloadListStore = useDownloadListStore()
downloadList.value = downloadListStore.downloadList

const openLocalPath = (localPaht) => {
  window.api.openFolder(localPaht).catch((err) => {
    ElMessage.error(err)
  })
}

const clearDone = () => {
  const arr = downloadListStore.downloadList.filter((item) => item.status !== DownloadStatus.DONE)
  downloadListStore.coverList(arr)
}

let isPageShow = false

watch(
  () => downloadListStore.downloadList,
  (val) => {
    if (isPageShow) {
      downloadList.value = val
      updateFileListStatistics(val)
    }
  }
)

const updateFileListStatistics = (list) => {
  let allNumber = 0
  let doneNumber = 0
  let failNumber = 0

  if (!Array.isArray(list)) {
    globalStore.setFileListInfo(
      `全部: ${allNumber} 下载完成: ${doneNumber} 下载失败: ${failNumber}`
    )
    return
  }

  allNumber = list.length

  list.forEach((item) => {
    if (item.status === DownloadStatus.DONE) {
      doneNumber++
    } else if (item.status === DownloadStatus.FAIL) {
      failNumber++
    }
  })

  globalStore.setFileListInfo(`全部: ${allNumber} 下载完成: ${doneNumber} 下载失败: ${failNumber}`)
}

onActivated(() => {
  isPageShow = true
  downloadList.value = downloadListStore.downloadList
  updateFileListStatistics(downloadListStore.downloadList)
})

onDeactivated(() => {
  isPageShow = false
})
</script>

<style lang="less" scoped>
.container {
  height: 100%;
  .toolbar {
    margin: 0 15px;
    height: 44px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
  .file-list {
    height: calc(100% - 44px);
    .done-status {
      color: #67c23a;
    }
    .fail-status {
      color: red;
    }
    .open-folder-btn {
      height: 100%;
      line-height: 100%;
      .el-icon {
        cursor: pointer;
        &:hover {
          color: #409eff;
        }
      }
    }
  }
}
</style>
