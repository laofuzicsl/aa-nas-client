const { app } = require('electron')
import { ipcMain } from 'electron'
import pathLib from 'path'
import fs from 'fs'

// 获取配置文件路径
export function getConfigPath() {
  const isDevelopment = process.env.NODE_ENV === 'development'
  return isDevelopment
    ? pathLib.join(__dirname, '../../config.json') // 开发环境
    : pathLib.join(pathLib.dirname(app.getPath('exe')), 'config.json') // 生产环境
}

// 读取配置文件
export function readConfig() {
  const configPath = getConfigPath()
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
}

let config = readConfig()
console.log('Configuration information:', config)

// 写入配置文件
export function writeConfig(newConfig) {
  const configPath = getConfigPath()
  fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2))
}

export function getAddress() {
  return {
    SERVER_IP: config.server_ip,
    SERVER_ADDR: `http://${config.server_ip}:8888`,
    SERVER_ADDR_WS: `ws://${config.server_ip}:8889`
  }
}

ipcMain.handle('readConfig', async () => {
  return config
})

ipcMain.handle('writeConfig', async (e, newConfig) => {
  writeConfig(newConfig)
  config = readConfig()
  return config
})

ipcMain.handle('getAddress', async () => {
  return getAddress()
})
