<template>
  <div class="container">
    <div class="toolbar">
      <el-button size="small" @click="clearDone">清除已完成</el-button>
    </div>
    <div class="file-list">
      <el-auto-resizer>
        <template #default="{ height, width }">
          <el-table-v2 :columns="columns" :data="uploadList" :width="width" :height="height" />
        </template>
      </el-auto-resizer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onActivated, onDeactivated, h } from 'vue'
import { Download, UploadStatus } from '../../const/enum'
import { $bus } from '../../utils/eventBus'
import { useUploadListStore } from '../../stores/uploadList'
import { calcFileShowSize } from '../../utils'
import { useGlobalStore } from '../../stores/global'
import { ElText } from 'element-plus'

const uploadList = ref([])
const globalStore = useGlobalStore()
const uploadListStore = useUploadListStore()
uploadList.value = uploadListStore.uploadList

let isPageShow = false

const columns = [
  {
    title: '文件名',
    key: 'fileName',
    dataKey: 'fileName',
    width: 5000
  },
  {
    title: '文件大小',
    key: 'size',
    dataKey: 'size',
    width: 1000,
    cellRenderer: ({ cellData }) => {
      return calcFileShowSize(cellData)
    }
  },
  {
    title: '上传状态',
    key: 'status',
    dataKey: 'status',
    width: 1000,
    cellRenderer: ({ cellData }) =>
      h(
        'div',
        {
          class: {
            'done-status': cellData === UploadStatus.DONE3,
            'fail-status': cellData === UploadStatus.FAIL
          }
        },
        cellData
      )
  }
]

const clearDone = () => {
  const arr = uploadListStore.uploadList.filter((item) => item.status !== UploadStatus.DONE3)
  uploadListStore.coverList(arr)
}

watch(
  () => uploadListStore.uploadList,
  (val) => {
    if (isPageShow) {
      uploadList.value = val
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
      `全部: ${allNumber} 上传完成: ${doneNumber} 上传失败: ${failNumber}`
    )
    return
  }

  allNumber = list.length

  list.forEach((item) => {
    if (item.status === UploadStatus.DONE3) {
      doneNumber++
    } else if (item.status === UploadStatus.FAIL) {
      failNumber++
    }
  })

  globalStore.setFileListInfo(`全部: ${allNumber} 上传完成: ${doneNumber} 上传失败: ${failNumber}`)
}

onActivated(() => {
  isPageShow = true
  uploadList.value = uploadListStore.uploadList
  updateFileListStatistics(uploadListStore.uploadList)
})

onDeactivated(() => {
  isPageShow = false
})

onMounted(() => {})
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

    :deep .el-virtual-scrollbar {
      display: none;
    }

    :deep .done-status {
      color: #67c23a;
    }
    :deep .fail-status {
      color: red;
    }
  }
}
</style>
