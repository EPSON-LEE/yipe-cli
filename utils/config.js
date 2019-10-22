/*
 * @Author: lijiahao
 * @Date: 2019-10-22 16:57:38
 * @LastEditors: superYipe
 * @LastEditTime: 2019-10-22 17:00:35
 */
const fs = require('fs')
const { encode, decode } = require('ini');
const { defaultConfig, configFile } = require('./constants');

module.exports = (action, k, v) => {
  const flag = fs.existsSync(configFile); const obj = {};
  if (flag) { // 配置文件存在
    const content = fs.readFileSync(configFile, 'utf8'); const c = decode(content); // 将文件解析成对象 Object.assign(obj, c);
  }
  if (action === 'get') {
    console.log(obj[k] || defaultConfig[k]);
  } else if (action === 'set') {
    obj[k] = v;
    fs.writeFileSync(configFile, encode(obj)); // 将内容转化ini格式写入到字符串中 console.log(`${k}=${v}`);
  } else if (action === 'getVal') {
    return obj[k];
  }
}