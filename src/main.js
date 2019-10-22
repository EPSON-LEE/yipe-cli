/*
 * @Author: lijiahao
 * @Date: 2019-10-22 14:40:22
 * @LastEditors: superYipe
 * @LastEditTime: 2019-10-22 17:41:59
 */
const program = require('commander')
const path = require('path')
const { version } = require('../utils/constants')

const actionsMap = {
  create: { // 创建模板
    description: "create project",
    alias: "cr",
    examples: [
      'yipe create <template>',
    ],
  },
  config: { // 配置文件
    description: 'config info',
    alias: 'c',
    examples: [
      'yipe config get <k>',
      'yipe config set <k> <v>'
    ]
  },
  '*': { // 都匹配不到
    description: 'comand not found'
  }
}

// create commands for loop

Object.keys(actionsMap).forEach(action => {
  program.command(action)
    .alias(actionsMap[action].alias)
    .description(actionsMap[action].description)
    .action(_ => {
      if (action === '*') { // 动作没有匹配到说明输入有误
        console.log(actionsMap[action].description)
      } else {
        // 定位到 create.js 所在的位置
        require(path.resolve(__dirname, action))(...process.argv.slice(3))
      }
    })
})

program.version(version)
  .parse(process.argv)

program.on('--help', _ => {
  console.log('i am helping')
  Object.keys(actionsMap).forEach(action => {
    (actionsMap[action.examples] || []).forEach(example => {
      console.log(`  ${example}`);
    })
  })
})
