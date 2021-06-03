#!/usr/bin/env node
const chalk = require('chalk')
const path = require('path')
const getArgs = require('./modules/getArgs')
const runCommands = require('./modules/runCommands')
const { fork } = require('child_process')
const conf = require('./config')

const args = getArgs()
const dir = args.d || conf.dir
const deployOnly = args.deployOnly !== undefined
const zipname = conf.zipname
const remote = conf.remote
const remoteDirectory = `${conf.remoteDirectory}/${dir}`
const commands = [
  `find ${path.resolve('dist')} -name "*.DS_Store" -type f -delete`,
  `cd ${path.resolve('dist')} && zip -r '${zipname}.zip' *`,
  `scp ${path.resolve('dist', `${zipname}.zip`)} ${remote}:~`,
  `fork ${path.resolve(
    'build',
    'deploy',
    'ssh'
  )} -r ${remote} -z ${zipname} -d ${remoteDirectory}`,
  `cd ${path.resolve('dist')} && rm -r ${zipname}.zip`,
]

if (deployOnly) {
  runCommands(commands)
    .then(stdout => console.log(stdout))
    .catch(err => console.log(chalk.red(`✖ Error\n${err}`)))
} else {
  fork(path.resolve('build', 'deploy', 'build.js')).on('close', code => {
    if (code === 0) {
      runCommands(commands)
        .then(stdout => console.log(stdout))
        .catch(err => console.log(chalk.red(`✖ Error\n${err}`)))
    }
  })
}
