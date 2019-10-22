<!--
 * @Author: lijiahao
 * @Date: 2019-10-22 14:10:23
 * @LastEditors: superYipe
 * @LastEditTime: 2019-10-22 16:56:13
 -->
# cli 的开发设计

## 针对当前的问题

- 业务类型多
- 项目升级，没有统一的 cli 脚手架
- 代码规范问题无法统一

## 依赖的包

|  依赖的包   | 作用  |
|  ----  | ----  |
| commander  | 参数解析 |
| inquire  | 交互式命令 |
| download-git-repo  | git中下载模板 |
| chalk  | 控制台颜色 |
| metalsmit  | 读取所有文件 |

## 工程化

|  依赖的包   | 作用  |
|  ----  | ----  |
| husky  | git hooks |


## 用法 Usage

```
yipe -h
```

## 搭建过程

### 文件目录

```
├── bin
│ └── www // 全局命令执行的根文件 ├── package.json
|—— package.json
├── src
│ ├── main.js // 入口文件
│ └── utils // 存放工具方法 │── .huskyrc // git hook
│── .eslintrc.json // 代码规范校验
```

### eslint 配置

配置 package.json 校验 src 文件下的代码

```
"scripts": {
  "lint": "eslint src" 
}
```

### 配置 husky

配置 git hooks 判断在提交的时候是否符合规范

### 链接全局包

设置在命令下执行 yipe 时调用 bin 目录下的 www 文件。

```
"bin" : {
  "yipe": "./bin/www"
}
```
www 文件中使用 main 作为入口文件，并且使用该 node 环境执行这个文件。

```
#! /usr/bin/env node
require('../src/main.js')
```

链接包到全局

```
npm link
```

现在我们已经可以使用 yipe 命令，并且可以执行 main.js 文件。

## 3 解析命令行参数

使用 commander 可以进行参数解析，像这样

```
vue -V
vue add <package-name>
```

### 3.1 使用 commander

```
npm install commander
```
main.js 是我们的入口文件

```
const program = require('commander')

program.version('0.0.1')
  .parse(process.argv) // 用户在命令行中输入的参数
```
这个时候输入 yipe -V 已经可以看到提示。

版本号是我们当前项目的 cli package.json 中的 version，我们需要动态获取，并且将所有的常量放到 util 下的 constants 文件夹中

```
const { name, version } = require('../../package.json')

module.exports = {
  name,
  version
}
```

这样就可以动态获取版本号了

```
const program = require('commander')
const { version } = require('../utils/constants')

program.version(version)
  .parse(process.argv) // 用户在命令行中输入的参数
```

### 3.2 配置指令命令

根据我们想要实现的功能配置执行动作，产生对应的执行命令

```
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
      console.log('action')
    })
})

program.version(version)
  .parse(process.argv)
```

### 3.3 编写help 命令

监听 help 命令打印帮助信息

```
program.on('--help', _ => {
  console.log('i am helping')
  Object.keys(actionsMap).forEach(action => {
    (actionsMap[action.examples] || []).forEach(example => {
      console.log(`  ${example}`);
    })
  })
})
```

现在已经配置完所有的命令行，接下来实现具体的功能。

## create 命令

create 的作用是去 git 仓库中获取模板并下载到本地，如果有模板规则着根据用户填写的信息渲染好模板，生成到当前运行命令的目录下：

```
action(_ => {
  if (action === '*') { // 动作没有匹配到说明输入有误
    console.log(actionsMap[action].description)
  } else {
    require(path.resolve(__dirname, action))(...process.argv.slice(3))
  }
})
```

创建 create.js

```
module.exports = async (projectName) => {
  console.log(projectName)
}
```
执行 yipe create project 可以打印出 project

### 4.1 远程拉取项目

安装 axios

```
npm i axios
```
这里借助 github 的 api

```
const axios = require('axios')
const fetchRepoList = async () => {
  const { data } = await axios.get('https://api.github.com/orgs/zhu-cli/repos')
  return data
}

module.exports = async (projectName) => {
  let repos = await fetchRepoList()
  repos = repos.map(item => item.name)
  console.log(repos)
}
```
现在安装用户体验很差，这里我们希望安装的结果是可供选择的。

### 4.2 inquirer & ora

```
npm i inquirer ora
```

```
module.exports = async (projectName) => {
  
  const spinner = ora('fetching repo list')
  spinner.start()
  let repos = await fetchRepoList()

  <!-- 选择模板 -->
  repos = repos.map(item => item.name)
  const { repo } = await Inquirer.prompt({
    name: 'repo',
    type: 'list',
    message: 'please choice repo template to create project',
    choices: repos // 选择模式
  })
  console.log(repo)
}
```
命令行中的选择功能基本都是基于 inquirer 实现的，可以实现不同的询问方式。

### 4.3 获取版本信息

和获取版本一样，我们可以获取版本信息

```
const fetchTagList = async repo => {
  const data = await axios.get(`https://api.github.com/repos/zhu-cli/${repo}/tags`)
  return data
}

<!-- 获取版本信息 -->
spinner = ora('fetching repos tag')
spinner.start()
let tags = await fetchTagList(repo)
spinner.succeed()

<!-- 选择版本 -->
tags = tags.map(item => item.name)
const { tag } = await Inquirer.prompt({
  name: 'tag',
  type: 'list',
  message: 'please choice repo template to create project',
  choices: tags
})
```
我们发现每次都有手动控制loading, 简单的封装下

```
const wrapFetchAddLoding = (fn, message) => async (...args) => { const spinner = ora(message);
spinner.start(); // 开始loading
const r = await fn(...args);
spinner.succeed(); // 结束loading
return r; };
// 这回用起来舒心多了~~~
let repos = await wrapFetchAddLoding(fetchRepoList, 'fetching repo list')(); let tags = await wrapFetchAddLoding(fetchTagList, 'fetching tag list')(repo);
```

### 4.4 下载项目

我们已经成功获取到了项目模板名称和对应的版本，接下来就可以直接下载了。

```
npm i download-git-repo
```
但是这个方法不是 promise 方法，需要我们包装一下

```
const { promisoify } = require('util')
const downLoadGit = require('download-git-repo')
downLoadGit = promisify(downLoadGit)
```

node 中已经集成好了一个现成的方法，将异步的 api 快速转换为 promise 的形式，下载前先找个临时目录存放下载文件

```
const downloadDirectory = `${process.env[process.platform === 'darwin' ? 'Home' : 'USERPROFILE']/.template}
```

这里我们将文件下载到当前用户下的 .template 文件中，由于系统的不同目录获取方式是不一样的， porcess.platform 在 windows 下获取到的是 win32 ，mac获取的值是darwin, 
再根据对应的变量环境获取到用户目录。

```
const downLoad = async (repo, tag) => {
  let api = `zhu-cli/${repo}`; // 下载项目 if (tag) {
    api += `#${tag}`;
  }
  const dest = `${downloadDirectory}/${repo}`; // 将模板下载到对应的目录中 await downLoadGit(api, dest);
  return dest; // 返回下载目录
} 

// 下载项目
const target = await wrapFetchAddLoding(download, 'download template')(repo, tag);
```

对于简单的项目可以直接把下载好的项目拷贝到当前执行命令的目录下。
安装 ncp 可以实现 文件的拷贝功能

```
npm i ncp
```

像这样

```
let ncp = require('ncp')
ncp = primisify(ncp)
<!-- 将下载的目录拷贝到当前执行的目录下 -->
await ncp(target, path.join(path.resolve(), projectName))
```

这里可以更严谨一些，比如判断当前目录下是否有重复文件名，还有很多细节比如多次创建项目是否要利用已经下载好的模板。

### 4.5 模板编译

刚刚说的是简单文件，我们直接进行拷贝就可以了，但是有的时候用户需要定制下载模板中的内容。拿package.json 文件举例，用户可以根据提示给项目命名、设置描述文件等等。

这里增加了 asj.js

```
module.exports = [
    {
      type: 'confirm',
      name: 'private',
      message: 'ths resgistery is private?',
    },
    {
      type: 'input',
      name: 'author',
      message: 'author?',
    },
    {
      type: 'input',
      name: 'description',
      message: 'description?',
    },
    {
      type: 'input',
      name: 'license',
      message: 'license?',
    },
  ]
```

根据对应的询问生成了最终的package.json
下载的模板中使用了 ejs 模板
```
{
  "name": "vue-template",
  "version": "0.1.2",
  "private": "<%=private%>",
  "scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build"
  },
  "dependencies": {
    "vue": "^2.6.10"
  },
  "autor":"<%=author%>",
  "description": "<%=description%>",
  "devDependencies": {
    "@vue/cli-service": "^3.11.0",
    "vue-template-compiler": "^2.6.10"
  },
  "license": "<%=license%>"
}
```
写到这里，大家应该想到了!核心原理就是将下载的模板文件，依次遍历根据用户填写的信息渲
染模板，将渲染好的结果拷贝到执行命令的目录下

安装需要用到的模块 
```
npm i metalsmith ejs consolidate
```

## 5 config 命令

新建 config.js 主要的命令是配置文件的读写操作，先来编写常量。

constants.js 的配置

```
const configFile = `${process.env[process.platform === 'darwin' ? 'HOME' : 'USERPROFILE']}/.zhurc`; // 配置文件的存储位置
const defaultConfig = {
repo: 'zhu-cli', // 默认拉取的仓库名 };
```

