import { getCurrentTime } from './index'

const originConsoleLog = console.log
const originConsoleWarn = console.warn
const originConsoleError = console.error

console.log = function (...args) {
  originConsoleLog.apply(console, [...args, getCurrentTime()])
}

console.warn = function (...args) {
  originConsoleWarn.apply(console, [...args, getCurrentTime()])
}

console.error = function (...args) {
  originConsoleError.apply(console, [...args, getCurrentTime()])
}
