import { app, shell, BrowserWindow, Tray, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import './utils/file.js'
import './utils/notification.js'
import './utils/system.js'
import './utils/config.js'

let mainWindow = null
let tray = null // 系统托盘
let isQuitWindow = false

function createWindow() {
  // 创建浏览器窗口.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    minHeight: 600,
    minWidth: 800,
    show: false,
    icon, // 窗口右上角图标
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: true // 关闭web安全策略，允许读取本地资源
      // devTools: false
    },
    acceptFirstMouse: true,
    dragAndDrop: true
  })

  // 当页面已经渲染完成（但是还没有显示）并且窗口可以被显示时触发
  mainWindow.on('ready-to-show', () => mainWindow.show())

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 基于electron-vite的HMR渲染器
  // 加载用于开发的远程URL或用于生产的本地html文件
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: '/' })
  }

  mainWindow.on('close', (event) => {
    // 防止在点击退出时，无法关闭软件进程
    if (!isQuitWindow) {
      event.preventDefault()
      mainWindow.hide()
    }
  })
  global.mainWindow = mainWindow
}

function createTray() {
  tray = new Tray(icon)
  const contextMenu = Menu.buildFromTemplate([
    { label: '显示窗口', click: showWindow },
    { label: '隐藏窗口', click: hideWindow },
    { label: '退出', click: quitApp }
  ])
  tray.setContextMenu(contextMenu)
  tray.setToolTip('AA-NAS客户端')

  tray.on('double-click', () => {
    if (mainWindow.isVisible()) {
      hideWindow()
    } else {
      showWindow()
    }
  })
}

function showWindow() {
  mainWindow && mainWindow.show()
}

function hideWindow() {
  mainWindow && mainWindow.hide()
}

function quitApp() {
  isQuitWindow = true
  app && app.quit()
}

// 这个方法将在Electron完成时被调用
// 初始化，并准备创建浏览器窗口
// 有些api只能在此事件发生后使用
app.whenReady().then(() => {
  // 设置windows应用的用户模型id
  electronApp.setAppUserModelId('AA-NAS客户端')

  // 在开发中默认通过F12打开或关闭DevTools
  // 在生产环境中忽略commandcontrol + R
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  // 创建自定义菜单
  // createCustomApplicationMenu(mainWindow)
  mainWindow.menuBarVisible = false

  // 开发模式下打开开发者工具
  if (process.env.NODE_ENV === 'development') {
    // 运行之后，自动打开开发者工具
    mainWindow.webContents.openDevTools()
  }
  app.on('activate', function () {
    // 在macOS上，在应用程序中重新创建一个窗口是很常见的
    // 点击Dock图标，没有其他窗口打开。
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // 创建系统托盘
  createTray()
})

// 当所有窗口都关闭时退出，除了macOS。在那里，这很常见
// 让应用程序及其菜单栏保持活动状态，直到用户退出
// 显式地使用Cmd + Q
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // app.quit()
  }
})
