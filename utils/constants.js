/*
 * @Author: lijiahao
 * @Date: 2019-10-22 14:54:43
 * @LastEditors: superYipe
 * @LastEditTime: 2019-10-23 12:10:54
 */
const { name, version } = require('../package.json')
const path = require('path')
// const configFile = `${process.env[process.platform === 'darwin' ? 'HOME' : 'USERPROFILE']}/.zhurc`; // 配置文件的存储位置
const configFile = path.resolve(`../.yiperc`) // 配置文件的存储位置
const defaultConfig = {
  repo: 'zhu-cli', // 默认拉取的仓库名 };
}
module.exports = {
  name,
  version,
  configFile,
  defaultConfig
}