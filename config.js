/*
 * @Author: lijiahao
 * @Date: 2019-10-23 11:02:53
 * @LastEditors: superYipe
 * @LastEditTime: 2019-10-23 16:52:41
 */
const fs = require('fs')
const { decode, encode } = require('ini')
const { defaultConfig, configFile } = require('./utils/constants')

const chalk = require('chalk')

module.exports = (action, k, v) => {
  const flag = fs.existsSync('.yiperc')
  console.log(chalk.magenta(`${flag}`))
  const obj = {}
  if (flag) { // 配置文件存在
    const content = fs.readFileSync('.yiperc', 'utf-8')
    const c = decode(content) // 文件解析为对象
    Object.assign(obj, c)
  }
  if (action === 'get') {
  } else if (action === 'set') {
    obj[k] = v
    fs.writeFileSync(configFile, encode(obj)) // 内容转化为 ini 格式写入到字符串中
  } else if (action === 'getval') {
    return obj[k]
  }
}
