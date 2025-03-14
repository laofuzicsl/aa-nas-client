const { dialog, ipcMain } = require('electron')
const fs = require('fs')
const pathLib = require('path')
const axios = require('axios')
const FormData = require('form-data')
const os = require('os')
const { exec } = require('child_process')
const promisify = require('util').promisify
const execAsync = promisify(exec)
import { showNotification } from './notification'
import { UPDATE_DOWNLOAD_PROGRESS } from '../../renderer/src/const/event_name'
import { FOLDER_KEY, FILE_KEY } from '../../renderer/src/const/file_type'
import { throttle } from 'loadsh'
import { getAddress } from './config'
import { randomUUID } from 'crypto'
/**
 * 文件操作工具类
 */

// /**
//  * 打开文件并读取文件的text
//  */
// export const readFile = async () => {
//   const filePath = await getFilePath()
//   const data = await fs.readFile(filePath)
//   return { filePath, data: data.toString() }
// }

// 获取文件路径
export const getFilePath = async () => {
  const res = await dialog.showOpenDialog({
    // 文件过滤
    filters: [
      { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })

  const { canceled, filePaths } = res
  // console.log('选取的文件', res)
  if (!canceled) {
    return filePaths[0]
  }
  return ''
}

// 获取文件
export const getFile = async (e, { path }) => {
  let filePath = path
  if (!filePath) {
    filePath = await getFilePath()
  }

  const data = fs.readFileSync(filePath)
  return {
    data,
    fileName: pathLib.basename(filePath)
  }
}

/**
 * 获取文件夹下所有文件路径
 */
export const getDirPath = async (e, dirPath) => {
  const pathArr = []
  if (dirPath) {
    // 读取文件夹下的所有文件
    const files = fs.readdirSync(dirPath)
    files.forEach((path) => {
      const stats = fs.statSync(dirPath + '\\' + path)
      let isFile = stats.isFile()
      let isDir = stats.isDirectory()
      let fileType = (isDir || isFile) && isDir ? FOLDER_KEY : FILE_KEY
      pathArr.push({ path: dirPath + '\\' + path, fileName: path, fileType, ...stats })
    })
  }

  return pathArr
}

// 根据文件的绝对路径或者文件的路径
const getFilePathByAbsolutePath = (path) => {
  if (!path) return ''

  return pathLib.dirname(path)
}

const joinPath = (e, paths) => {
  if (!Array.isArray(paths)) return ''

  let res = pathLib.normalize(pathLib.join(...paths))
  if (res === '.') return ''
  return res
}

// 获取文件并获取同文件件下所有的同类型问题
export const getFileAndAllFile = async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    // 文件过滤
    filters: [
      { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  let data = { current: '', all: [] }
  if (!canceled) {
    data.current = filePaths[0]
  }
  // 判断选中的是否为图片
  if (!isImage(data.current)) return null

  data.all = getPeerFiles(data.current)

  return data
}

// 根据文件路径获取同级别路径下的所有文件
export const getPeerFiles = (path) => {
  if (path === '') {
    return
  }
  const arr = path.split('\\')
  arr.pop()
  let dirPath = arr.join(`\\`)

  const paths = []
  if (dirPath) {
    // 读取文件夹下的所有文件
    const files = fs.readdirSync(dirPath)
    files.forEach((path) => {
      if (isImage(path)) {
        paths.push(dirPath + '\\' + path)
      }
    })
  }
  return paths
}

// 判断路径是否为图片路径
const isImage = (path) => {
  if (!path) return false
  const reg = /(\.jpg|\.jpeg|\.JPG|\.JPEG|\.PNG|\.png|\.GIF|\.gif|\.'WebP')$/g
  return reg.test(path)
}

const createFolder = (folderPath) => {
  return new Promise((resolve, reject) => {
    fs.access(folderPath, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          console.log(`${folderPath} 文件夹不存在。`)
          fs.mkdir(folderPath, { recursive: true }, (err) => {
            if (err) {
              console.error(`${folderPath} 文件夹创建失败：${err}`)
              reject(false)
            }
            console.log(`${folderPath} 文件夹创建成功。`)
            resolve(true)
          })
        } else {
          console.error(`出现错误：${err}`)
          reject(false)
        }
      } else {
        console.log(`${folderPath} 文件夹存在且具有访问权限。`)
        resolve(true)
      }
    })
  })
}

const throttleSend = throttle((name, param) => {
  global.mainWindow.send(name, param)
}, 100)

const download = (fileInfo, rootPath) => {
  const { downloadUrl, fileName, savePath, size, filePath: serverFilePath } = fileInfo
  return new Promise((resolve, reject) => {
    axios
      .get(downloadUrl, {
        responseType: 'stream'
      })
      .then(async (res) => {
        const filePath = pathLib.join(rootPath, savePath, fileName)
        // 判断保存路径是否存在
        const folderPath = pathLib.dirname(filePath)
        const bRes = await createFolder(folderPath)
        if (!bRes) {
          showNotification('下载通知', fileName + '下载失败')
          reject({ result: false, localPath: filePath, downloadPath: downloadUrl, serverFilePath })
          return
        }
        const writer = fs.createWriteStream(filePath)
        res.data.pipe(writer)
        let downloadedBytes = 0

        res.data.on('data', (chunk) => {
          downloadedBytes += chunk.length

          let percent = (downloadedBytes / size) * 100
          if (percent < 100) percent = percent.toFixed(2)
          throttleSend(UPDATE_DOWNLOAD_PROGRESS, {
            filePath: serverFilePath,
            downloadedBytes,
            data: percent + '%'
          })
        })

        writer.on('finish', () => {
          showNotification('下载通知', fileName + '下载完成')
          resolve({ result: true, path: filePath, downloadPath: downloadUrl, serverFilePath })
        })
        writer.on('error', (err) => {
          showNotification('下载通知', fileName + '下载失败')
          reject({ result: false, path: filePath, downloadPath: downloadUrl, serverFilePath })
        })
      })
  })
}

const downloadFile = (e, { fileInfo, savePath }) => {
  return download(fileInfo, savePath)
}

// 将选中的要上传的文件信息进行重组
const regroupUploadFileInfo = (e, { fileList, serverSavePath }) => {
  if (fileList.length === 0) return []

  // 获取当前文件列表所在的文件夹路径
  const rootPath = pathLib.dirname(fileList[0])
  const res = []

  const getFileInfo = (path, rootPath) => {
    const stats = fs.statSync(path)
    if (stats.isDirectory()) {
      const files = fs.readdirSync(path)

      const filePaths = files.map((fileName) => pathLib.join(path, fileName))
      filePaths.forEach((filePath) => getFileInfo(filePath, rootPath))
    } else {
      // 使用文件所在的文件夹路径与根路径做对比，获取到文件到服务后要保存的路径
      const filePath = pathLib.dirname(path)
      let savePath = filePath.replace(rootPath, '')
      savePath = joinPath(null, [serverSavePath, savePath])
      res.push({
        path,
        fileName: pathLib.basename(path),
        size: stats.size,
        type: pathLib.extname(path),
        savePath
      })
    }
  }

  fileList.forEach((path) => {
    getFileInfo(path, rootPath)
  })
  return res
}

// 获取当前电脑上最大的盘符及所剩空间
const getLargestFreeSpacePartitionWindows = async () => {
  let maxFreeSpace = 0
  let maxFreeDisk = null
  const { stdout } = await execAsync('wmic logicaldisk get size,freespace,caption')
  const lines = stdout.split('\n').filter(Boolean)
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(/\s+/).filter(Boolean)
    const freeSpace = parseInt(parts[1])
    if (freeSpace > maxFreeSpace) {
      maxFreeSpace = freeSpace
      maxFreeDisk = parts[0]
    }
  }
  return { drive: maxFreeDisk, freeSpace: maxFreeSpace }
}

// 获取文件夹路径
export const getFolderPath = async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  if (!canceled) {
    return filePaths[0]
  }
  return ''
}

export const checkFileExistSync = (e, paths) => {
  if (!Array.isArray(paths)) {
    return []
  }

  paths.forEach((item) => {
    try {
      if (fs.existsSync(item.targetPath)) {
        item.exist = true
      } else {
        item.exist = false
      }
    } catch (err) {
      item.exist = false
    }
  })
  return paths
}

// 上传文件
export const uploadFile = (
  e,
  { path = '', savePath = '', selfInfo, targetInfo, serverCurrentPath }
) => {
  return new Promise((resolve, reject) => {
    // 判断文件是否存在
    if (!fs.existsSync(path)) {
      reject(false)
    }

    // 获取文件大小
    const stats = fs.statSync(path)
    const fileSize = stats.size

    const CHUNK_SIZE = 1024 * 1024 * 5 // 固定每次读取5M的数据，将文件分块上传
    const readStream = fs.createReadStream(path, { highWaterMark: CHUNK_SIZE }) // 创建可读流

    const totalChunks = Math.ceil(fileSize / CHUNK_SIZE) // 计算文件分块的总数

    let index = 0 // 当前文件分块的索引
    const uuid = randomUUID() // 生成唯一标识，用于文件名

    const fileName = pathLib.basename(path) // 获取文件名

    readStream.on('data', (chunk) => {
      readStream.pause() // 暂停读取文件
      const formData = new FormData()

      formData.append('totalChunks', totalChunks) // 文件分块的总数
      formData.append('chunkIndex', index) // 当前文件分块的索引

      formData.append('file', chunk, `file_name_${uuid}${pathLib.extname(fileName)}%%${index}`)
      formData.append('tempFileName', `file_name_${uuid}${pathLib.extname(fileName)}`)

      formData.append('fileName', fileName)
      formData.append('currentPath', serverCurrentPath) // 当前文件服务器展示路径
      formData.append('savePath', savePath) // 在服务器上当前的保存路径
      formData.append('selfInfo', selfInfo)
      formData.append('targetInfo', targetInfo)
      formData.append('uploadPath', path) // 文件在客户端上的路径
      formData.append('serverIP', getAddress().SERVER_IP) // 服务端地址

      index++

      axios
        .post(`${getAddress().SERVER_ADDR}/file/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        .then((res) => {
          if (res.code === 200) {
            console.log(fileName, '文件上传成功', res)
          }
        })
        .finally(() => {
          readStream.resume() // 恢复读取文件
          // console.log('recover write', `file_name_${uuid}${pathLib.extname(fileName)}`)
        })
    })

    readStream.on('end', () => {
      resolve(`文件${fileName}上传成功`)
    })

    readStream.on('error', (err) => {
      reject(`文件${fileName}上传失败 ${err}`)
    })
  })
}

// 打开文件
ipcMain.handle('openDir', getDirPath)
// 获取文件路径
ipcMain.handle('getFilePathByAbsolutePath', getFilePathByAbsolutePath)
// 下载文件到指定路径
ipcMain.handle('downloadFile', downloadFile)
// 选取文件并获取文件路径
ipcMain.handle('getFile', getFile)
// 将选中的要上传的文件信息进行重组
ipcMain.handle('regroupUploadFileInfo', regroupUploadFileInfo)
// 获取文件夹路径
ipcMain.handle('getFolderPath', getFolderPath)
// 获取当前电脑上最大的盘符及所剩空间
ipcMain.handle('getLargestFreeSpacePartitionWindows', getLargestFreeSpacePartitionWindows)
// 拼接路径
ipcMain.handle('joinPath', joinPath)
// 检查文件是否存在
ipcMain.handle('checkFileExistSync', checkFileExistSync)
// 上传文件
ipcMain.handle('uploadFile', uploadFile)
