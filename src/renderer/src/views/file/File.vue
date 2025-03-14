<template>
  <div class="container">
    <div class="toolbar">
      <div class="toolbar-left">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item
            v-for="(item, index) in paths"
            :key="item.path"
            @click="clickBreadcrumbItem(item.path, index)"
          >
            <el-tooltip :content="item.title"
              ><a class="path-text">{{ item.title }}</a></el-tooltip
            ></el-breadcrumb-item
          >
        </el-breadcrumb>
      </div>

      <div class="toolbar-right">
        <el-tooltip content="刷新列表" placement="left">
          <el-button size="small" :icon="Refresh" circle @click="refresh"></el-button>
        </el-tooltip>
        <!-- <el-button size="small" @click="upload">上传</el-button> -->
        <el-button size="small" @click="download">下载</el-button>

        <el-button size="small" @click="createFolder">新建文件夹</el-button>

        <el-popconfirm
          title="确认删除吗？"
          confirm-button-text="删除"
          cancel-button-text="取消"
          confirm-button-type="danger"
          @confirm="deleteFile"
        >
          <template #reference>
            <el-button size="small" type="danger">删除</el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>
    <div class="file-list">
      <el-table ref="tableRef" :data="fileList" style="width: 100%" height="100%">
        <el-table-column type="selection" width="30" />
        <el-table-column label="文件名">
          <template #default="{ row }">
            <div class="file-name" @dblclick="dblclickRow(row)">
              <img class="icon" :src="fileIconList[row.fileType]" />
              <el-text style="margin-left: 10px">{{ row.fileName }}</el-text>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="最后修改时间" width="200">
          <template #default="{ row }">
            {{ formatTimestap(row.mtimeMs) }}
          </template>
        </el-table-column>
        <el-table-column label="文件大小" align="right" width="120" class="end-cell">
          <template #default="{ row }"> {{ calcFileShowSize(row.size) }}</template>
        </el-table-column>
      </el-table>
    </div>

    <CreateFolder
      ref="createFolderRef"
      :visible="createFolderVisible"
      @cancel="cancelCreateFolderDialog"
      @confirm="confirmCreateFolderDialog"
    />

    <ConfirmDialog
      :title="confirmState.title"
      :content="confirmState.content"
      :visible="confirmState.visible"
      @cancel="cancelConfirmDialog"
      @cover="handleCover"
      @skip="handleSkip"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, reactive, onUnmounted, onActivated, watch } from 'vue'
import { wsSend } from '../../api/websocket'
import { OperationType } from '../../const/enum'
import { Refresh } from '@element-plus/icons-vue'
import { $bus } from '../../utils/eventBus'
import { Document, Folder } from '@element-plus/icons-vue'
import { FOLDER_KEY, FILE_KEY } from '../../const/file_type'
import { formatTimestap } from '../../utils/index'
import { ElMessage, ElLoading } from 'element-plus'
import { getUserId, getSelfInfo, getServerInfo } from '../../const/user_key'
import { fileHttp } from '../../api/file'
import { calcFileShowSize } from '../../utils/index'
import { useGlobalStore } from '../../stores/global'
import { useDownloadListStore } from '../../stores/downloadList'
import { useUploadListStore } from '../../stores/uploadList'
import { uploadController } from '../../controller/UploadController'
import fileIcon from '../../assets/file.svg'
import folderIcon from '../../assets/folder.svg'
import CreateFolder from './components/CreateFolder.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import { getItem } from '../../utils/localStorage'
import { NAS_FOLDER_SAVE_PATH } from '../../const/user_key'
import { loading } from '../components/Loading'
import { useServerStateStore } from '../../stores/serverState'

const downloadListStore = useDownloadListStore()

const globalStore = useGlobalStore()

const serverStateStore = useServerStateStore()

onActivated(() => {
  updateFileListStatistics(fileList.value)
})

const fileIconList = {
  [FILE_KEY]: fileIcon,
  [FOLDER_KEY]: folderIcon
}

// 文件列表
const fileList = ref([])
// 文件路径
const paths = ref([{ title: '根目录', path: '' }])

const tableRef = ref(null)

const createFolderVisible = ref(false)

// 判断是上传还是下载
const isDownloadState = ref(true)

const confirmState = reactive({
  visible: false,
  title: '下载提示',
  content: '请输入提示内容',
  fullAmountList: [],
  incrementList: []
})

watch(
  () => serverStateStore.currentServer,
  (newVal) => {
    getFileList()
  }
)

$bus.on(OperationType.REFRESH, () => {
  refresh()
})

$bus.on(OperationType.CLEAR_FILE_LIST, () => {
  clearList()
})

// 检验文件是否存在
$bus.on(OperationType.DOWNLOAD_FILE_IS_EXIST_INFO, (data) => {
  checkDownloadFilePath(data)
})

$bus.on(OperationType.UPLOAD_FILE_IS_EXIST_INFO, (data) => {
  checkUploadFilePath(data)
})

$bus.on(OperationType.FILE_LIST, (data) => {
  updateFileList(data)
  loading.close()
})

const cancelCreateFolderDialog = () => {
  createFolderVisible.value = false
}

const confirmCreateFolderDialog = async (name) => {
  createFolderVisible.value = false
  const path = await window.api.joinPath([globalStore.currentPath, name])
  wsSend({
    type: OperationType.CREATE_FOLDER,
    data: path
  })
}

const refresh = () => {
  getFileList(globalStore.currentPath)
}

const clearList = () => {
  fileList.value = []
}

// 退出下载确认框
const cancelConfirmDialog = () => {
  confirmState.visible = false
  confirmState.content = '请输入提示内容'
  confirmState.title = '下载提示'
  confirmState.incrementList = []
  confirmState.fullAmountList = []
}

// 覆盖下载
const handleCover = () => {
  isDownloadState.value
    ? confirmDownload(confirmState.fullAmountList)
    : confirmUpload(confirmState.fullAmountList)
  cancelConfirmDialog()
}

// 跳过下载
const handleSkip = () => {
  isDownloadState.value
    ? confirmDownload(confirmState.incrementList)
    : confirmUpload(confirmState.incrementList)
  cancelConfirmDialog()
}

const checkDownloadFilePath = async (data) => {
  isDownloadState.value = true

  const filePaths = []
  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    const path = await window.api.joinPath([
      getItem(NAS_FOLDER_SAVE_PATH),
      item.savePath,
      item.fileName
    ])
    filePaths.push({ targetPath: path, sourcePath: item.path })
  }

  const res = await window.api.checkFileExistSync(filePaths)

  const existFileNum = res.filter((item) => item.exist).length
  const downloadList = data.filter(
    (item) =>
      !res.some((existItem) => {
        if (existItem.exist && existItem.sourcePath === item.path) return true
        else return false
      })
  )

  // 数据量大时不光服务端返回比较耗时，客户端解析数据也比较耗时
  // 需要在解析完成后关闭loading
  loading.close()

  /**
   * 如果文件都不存在，则直接下载
   * 如果有文件存在，则弹出对话框询问是否覆盖或者跳过
   **/
  if (existFileNum === 0) {
    confirmDownload(data)
  } else {
    confirmState.content = `一共${filePaths.length}个文件，检测到有${existFileNum}个文件已存在，是否跳过已存在的文件？`
    confirmState.title = '下载提示'
    confirmState.incrementList = downloadList
    confirmState.fullAmountList = data
    confirmState.visible = true
  }
}

const checkUploadFilePath = (data) => {
  isDownloadState.value = false

  if (!Array.isArray(data)) return

  const uploadList = data.filter((item) => !item.exist)
  const existFileNum = data.length - uploadList.length

  loading.close()

  if (existFileNum === 0) {
    confirmUpload(data)
  } else {
    confirmState.content = `一共${data.length}个文件，检测到有${existFileNum}个文件已存在，是否跳过已存在的文件？`
    confirmState.title = '上传提示'
    confirmState.incrementList = uploadList
    confirmState.fullAmountList = data
    confirmState.visible = true
  }
}

// 新建文件夹
const createFolder = () => {
  createFolderVisible.value = true
}

// 下载勾选的文件
const download = () => {
  const selectFiles = tableRef.value?.getSelectionRows()
  if (selectFiles.length === 0) {
    ElMessage.warning('请选择要下载的文件')
    return
  }
  // 在此时将下载的信息更新到下载列表中，等服务器响应后再进行实际现在
  // 以防用户认为点击了无效

  const param = {
    paths: selectFiles.map((item) => item.path),
    currentPath: globalStore.currentPath
  }

  // console.log('要下载的文件参数：', selectFiles, param)
  // fileHttp.download(param)
  wsSend({ type: OperationType.DOWNLOAD_FILE_IS_EXIST, data: param })
  loading.open()
}

const confirmDownload = (files) => {
  files.forEach((item) => {
    downloadListStore.add({
      originalName: item.fileName,
      path: item.path,
      size: calcFileShowSize(item.size),
      downloadProgress: '0%'
    })
  })

  fileHttp.download(files)
  ElMessage.success(`${files.length}个文件开始下载`)
}

const confirmUpload = (files) => {
  files.forEach((item) => {
    uploadController.add(item)
  })
  ElMessage.success(`${files.length}个文件开始上传`)
}

const deleteFile = async () => {
  const selectFiles = tableRef.value?.getSelectionRows()
  if (selectFiles.length === 0) {
    ElMessage.warning('请选择要删除的文件')
    return
  }
  // 在此时将下载的信息更新到下载列表中，等服务器响应后再进行实际现在
  // 以防用户认为点击了无效

  const paths = selectFiles.map((item) => item.path)

  wsSend({ type: OperationType.DELETE, data: paths })
}

const getFileList = (path) => {
  wsSend({ type: OperationType.REQ_FILE_LIST, data: path })
  loading.open()
}

const updateFileList = (list) => {
  fileList.value = list

  // 更新列表信息
  updateFileListStatistics(list)
}

const updateFileListStatistics = (list) => {
  let allNumber = 0
  let folderNumber = 0
  let fileNumber = 0

  if (!Array.isArray(list)) {
    globalStore.setFileListInfo(`全部: ${allNumber} 文件夹: ${folderNumber} 文件: ${fileNumber} `)
    return
  }

  allNumber = list.length

  list.forEach((item) => {
    if (item.fileType === FOLDER_KEY) {
      folderNumber++
    } else if (item.fileType === FILE_KEY) {
      fileNumber++
    }
  })

  globalStore.setFileListInfo(`全部: ${allNumber} 文件夹: ${folderNumber} 文件: ${fileNumber} `)
}

// 点击面包屑
const clickBreadcrumbItem = (path, index) => {
  globalStore.setCurrentPath(path)
  paths.value.splice(index + 1)
  getFileList(path)
}

const dblclickRow = (item) => {
  const { path, fileType } = item
  if (fileType !== FOLDER_KEY) {
    ElMessage.info('当前文件暂不支持在线预览')
    return
  }
  paths.value.push({ title: item.fileName, path })
  globalStore.setCurrentPath(path)
  getFileList(path)
}

const handleDragover = (event) => {
  event.preventDefault()
}

const handleDrop = (event) => {
  event.preventDefault()
  loading.open()

  let files = event.dataTransfer.files
  files = [...files]
  if (files.length > 0) {
    const fileList = files.map((item) => item.path)
    window.api
      .regroupUploadFileInfo({
        fileList,
        serverSavePath: globalStore.currentPath
      })
      .then((fileListInfo) => {
        // 给服务端发消息确认要上传的文件哪些是存在的，哪些是不存在的
        wsSend({ type: OperationType.UPLOAD_FILE_IS_EXIST, data: fileListInfo })
      })
  } else {
    loading.close()
  }
}

onMounted(() => {
  getFileList()

  document.addEventListener('dragover', handleDragover)
  document.addEventListener('drop', handleDrop)
})

onUnmounted(() => {
  document.removeEventListener('dragover', handleDragover)
  document.removeEventListener('drop', handleDrop)
})
</script>

<style lang="less" scoped>
.container {
  width: 100%;
  height: 100%;
  .toolbar {
    padding: 15px 12px 5px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    line-height: 20px;
    .toolbar-left {
      display: flex;
      align-items: center;
      :deep .el-breadcrumb__inner {
        cursor: pointer;
        max-width: 120px;
        text-wrap: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
  .file-list {
    height: calc(100% - 44px);
    overflow-y: auto;

    .icon {
      width: 16px;
      height: 16px;
    }

    :deep .el-table__cell {
      padding-right: 15px;
    }

    .file-name {
      cursor: pointer;
      display: flex;
      align-items: center;
    }
  }
}
</style>

<style lang="less">
::-webkit-scrollbar {
  width: 0px;
}

/*滚动条中间滑动部分*/
::-webkit-scrollbar-thumb {
  border-radius: 0px;
}
</style>
