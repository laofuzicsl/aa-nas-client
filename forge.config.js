const { FusesPlugin } = require('@electron-forge/plugin-fuses')
const { FuseV1Options, FuseVersion } = require('@electron/fuses')
const pathLib = require('path')
const fs = require('fs')

module.exports = {
  packagerConfig: {
    asar: true
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {}
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin']
    },
    {
      name: '@electron-forge/maker-deb',
      config: {}
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {}
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {}
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true
    })
  ],
  hooks: {
    postPackage: async (forgeConfig, packageResult) => {
      // 获取可执行文件目录
      const outputPath = packageResult.outputPaths[0] // 打包输出的目录
      const platform = packageResult.platform // 平台（如 darwin、win32、linux）
      const arch = packageResult.arch // 架构（如 x64）

      let executableDir

      if (platform === 'darwin') {
        // macOS: 可执行文件在 .app/Contents/MacOS/ 目录下
        const appName = forgeConfig.packagerConfig.name || require('./package.json').name
        executableDir = pathLib.join(outputPath, `${appName}.app`, 'Contents', 'MacOS')
      } else if (platform === 'win32') {
        // Windows: 可执行文件在输出目录下
        executableDir = outputPath
      } else if (platform === 'linux') {
        // Linux: 可执行文件在输出目录下
        executableDir = outputPath
      }

      // 源文件路径
      const srcFilePath = pathLib.resolve(__dirname, 'config.json')
      // 目标文件路径（可执行文件目录）
      const destFilePath = pathLib.join(executableDir, 'config.json')

      // 复制文件
      fs.copyFileSync(srcFilePath, destFilePath)
      console.log(`Copied ${srcFilePath} to ${destFilePath}`)
    }
  }
}
