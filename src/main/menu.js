const { Menu } = require('electron')
// import { getFilePath, getFilesPath } from './utils/file'

let mainWindow = null
/**
 * 菜单模板
 */
const emptyEmplate = []
const template = [
  {
    label: '文件',
    submenu: [
      {
        label: '打开文件',
        click: async () => {
          // const path = await getFilePath()
        }
      },
      {
        label: '打开文件夹',
        click: async () => {
          // const paths = await getFilesPath()
        }
      },
      {
        label: '退出',
        role: 'quit'
      }
    ]
  },
  {
    label: '编辑',
    submenu: [
      {
        role: 'undo',
        label: '撤销'
      },
      {
        role: 'redo',
        label: '恢复'
      },
      {
        role: 'cut',
        label: '剪切'
      },
      {
        role: 'copy',
        label: '复制'
      },
      {
        role: 'paste',
        label: '粘贴'
      },
      {
        role: 'delete',
        label: '删除'
      }
    ]
  }
]

/**
 * 创建菜单
 */
export const createCustomApplicationMenu = function (mainWin) {
  mainWindow = mainWin
  const menu = Menu.buildFromTemplate(emptyEmplate)
  Menu.setApplicationMenu(menu)
}
