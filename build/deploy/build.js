#!/usr/bin/env node
const chalk = require('chalk')
const path = require('path')
const runCommands = require('./modules/runCommands')
let commands = [
  `rm -rf ${path.join(process.env.PWD, 'dist')}`,
  `webpack --config ${path.join(process.env.PWD, 'webpack', 'webpack.prod.js')}`,
  `cp ${path.join(process.env.PWD, '*.js')} ${path.join(process.env.PWD, 'dist')}`,
  `cp ${path.join(process.env.PWD, 'package.json')} ${path.join(
    process.env.PWD,
    'dist'
  )}`,
  `find ${path.join(process.env.PWD, 'dist')} -name "*.DS_Store" -type f -delete`,
]
runCommands(commands)
  .then(stdout => process.stdout.write(stdout))
  .catch(err => process.stdout.write(chalk.red(`✖ Error\n${err}`)))
