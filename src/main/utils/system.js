const { ipcMain } = require('electron')
const macaddress = require('node-macaddress')
const { exec } = require('child_process')
const pathLib = require('path')

// 获取设备的MAC地址
export const getMacAddress = async () => {
  try {
    const macs = await macaddress.all()
    const keys = Object.keys(macs)

    if (keys.length === 0) return null

    const mac = macs[keys[0]].mac

    console.log('MAC Address: ', mac)
    return mac
  } catch (error) {
    console.error('Failed to obtain the mac address: ', error.message)
    return null
  }
}

// 打开文件夹
export const openFolder = (e, { path }) => {
  return new Promise((resolve, reject) => {
    const folderPath = pathLib.dirname(path)
    let command

    switch (process.platform) {
      case 'darwin':
        command = `open "${folderPath}"`
        break
      case 'win32':
        command = `start "" "${folderPath}"`
        break
      default:
        command = `xdg-open "${folderPath}"`
        break
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('执行命令时出错: ', error.message)
        reject('打开文件夹失败')
      }

      if (stderr) {
        console.error('命令执行过程中出现错误: ', stderr)
        reject('打开文件夹失败')
      }

      console.log('成功打开文件夹: ', stdout)
      resolve('打开文件夹成功')
    })
  })
}

ipcMain.handle('getMacAddress', getMacAddress)
ipcMain.handle('openFolder', openFolder)
