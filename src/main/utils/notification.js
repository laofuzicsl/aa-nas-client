import { ipcMain, Notification } from 'electron'

function showNotification(title, body) {
  new Notification({ title, body }).show()
}

function serverOfflineNotification() {
  showNotification('通知', '服务器不在线，请检查网络连接')
}

function serverOnlineNotification() {
  showNotification('通知', '服务器在线')
}

ipcMain.handle('serverOnlineNotification', serverOnlineNotification)
ipcMain.handle('serverOfflineNotification', serverOfflineNotification)
ipcMain.handle('showNotification', showNotification)

export { serverOfflineNotification, serverOnlineNotification, showNotification }
