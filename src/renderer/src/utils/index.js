import dayjs from 'dayjs'

// 根据路径获取文件名称
export function getFileNameFromPath(path) {
  if (typeof path !== 'string') return ''
  if (path === '') return ''

  const arr = path.split('/')
  if (arr.length > 0) return arr[arr.length - 1]

  return ''
}

// 格式化时间
export function formatTimestap(timestamp, isDate = false) {
  if (isDate) return dayjs(timestamp).format('YYYY-MM-DD')

  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

export const getCurrentTime = () => {
  return dayjs().format('YYYY-MM-DD HH:mm:ss.SSS')
}

// 校验手机号
export function validatePhoneNumber(phoneNumber) {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phoneNumber)
}

// 校验字符串是否只包含字母和数字
function validateString(str) {
  for (let char of str) {
    if (!/[a-zA-Z0-9]/.test(char)) {
      return false
    }
  }
  return true
}

// 校验密码, 至少包含字母和数字
export function validatePassword(str) {
  if (!validateString(str)) {
    return false
  }

  let hasLetter = false
  let hasNumber = false

  for (let char of str) {
    if (/[a-zA-Z]/.test(char)) {
      hasLetter = true
    }
    if (/[0-9]/.test(char)) {
      hasNumber = true
    }
    if (hasLetter && hasNumber) {
      return true
    }
  }

  return false
}

// 根据文件的字节大小，计算文件的显示大小
export const calcFileShowSize = (size) => {
  const showSize = size / 1024 / 1024
  if (showSize > 800) {
    return (showSize / 1024).toFixed(1) + 'GB'
  }

  return showSize.toFixed(1) + 'MB'
}
