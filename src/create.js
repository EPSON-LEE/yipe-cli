/*
 * @Author: lijiahao
 * @Date: 2019-10-22 15:35:44
 * @LastEditors: superYipe
 * @LastEditTime: 2019-10-23 16:51:35
 */
const axios = require('axios')
const ora = require('ora')
const Inquirer = require('Inquirer')
const { promisify } = require('util')
const path = require('path')
const ncp = promisify(require('ncp'))
const downLoadGit = promisify(require('download-git-repo'))
const log = console.log
const config = require('../config.js')
const repoUrl = config('getval', 'repo')
const chalk = require('chalk')
// const downloadDirectory = `${process.env[process.platform === 'darwin' ? 'HOME' : 'USERPROFILE']}/.template`;
const downloadDirectory = `../demo`

const download = async (repo, tag) => {
  let api = `${repoUrl}/${repo}`
  if (tag) {
    api += `#${tag}`
  }
  const dest = `${downloadDirectory}/${repo}` // 模板下载到对应目录中
  log(chalk.magenta("下载的目标地址是", dest))
  await downLoadGit(api, dest)
  return dest
}

const wrapperFetchAddLoading = (fn, message) => async (...args) => {
  const spinner = ora(message)
  spinner.start()
  const r = await fn(...args)
  spinner.succeed()
  return r
}


const fetchRepoList = async () => {
  log('repoUrl', repoUrl)
  const { data } = await axios.get(`https://api.github.com/orgs/${repoUrl}/repos`)
  log('结束')
  return data
}

const fetchingTagList = async (repo) => {
  log('repo', repo)
  log('repoUrl', repoUrl)
  const { data } = await axios.get(`https://api.github.com/repos/${repoUrl}/${repo}/tags`)
  return data
}

module.exports = async (projectName) => {
  let repos = await wrapperFetchAddLoading(fetchRepoList, 'fetching repo list')()
  // 选择 repos 模板
  repos = repos.map((item) => item.name);
  const { repo } = await Inquirer.prompt({
    name: 'repo',
    type: 'list',
    message: 'please choice repo template to create project',
    choices: repos
  });

  let tags = await wrapperFetchAddLoading(fetchingTagList, 'fetching Tag list')(repo)
  // 选择 tags 模板
  tags = tags.map((item) => item.name);
  const { tag } = await Inquirer.prompt({
    name: 'tags',
    type: 'list',
    message: 'please choice tags to create project',
    choices: tags
  });

  const target = await wrapperFetchAddLoading(download, 'download template')(repo, tag)
  // 下载的文件拷贝到当前执行命令的目录下
  await ncp(target, path.join(path.resolve(), projectName))
  process.exit(1)
}
