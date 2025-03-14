// import http from './http'
import { wsSend } from './websocket'
import { OperationType } from '../const/enum'
import { useGlobalStore } from '../stores/global'
// import { getSelfInfo, getServerInfo } from '../const/user_key'

const globalStore = useGlobalStore()
class File {
  // 登录接口
  download(param) {
    wsSend({ type: OperationType.DOWNLOAD, data: param })
  }

  // upload(param) {
  //   return http.post(`${SERVER_ADDR}/file/upload`, param)
  // }
}

// 上传文件
// export const uploadFile = (path = '', savePath = '') => {
//   return new Promise((resolve, reject) => {
//     window.api
//       .getFile({ path })
//       .then((data) => {
//         if (!data) {
//           reject(new Error('文件获取失败'))
//         }
//         const formData = new FormData()
//         formData.append('file', new Blob([data.data]), data.fileName)
//         formData.append('fileName', data.fileName)
//         formData.append('currentPath', globalStore.currentPath) // 当前文件服务器展示路径
//         formData.append('savePath', savePath) // 在服务器上当前的保存路径
//         formData.append('selfInfo', JSON.stringify(getSelfInfo()))
//         formData.append('targetInfo', JSON.stringify(getServerInfo()))
//         formData.append('uploadPath', path) // 文件在客户端上的路径

//         fileHttp.upload(formData).then((res) => {
//           const { code, data } = res
//           if (code === 200) {
//             // 更新上传状态为成功
//             resolve(data)
//           } else {
//             // 更新上传状态为失败
//             reject(data)
//           }
//         })
//       })
//       .catch((err) => {
//         reject(err)
//       })
//   })
// }
export const fileHttp = new File()
