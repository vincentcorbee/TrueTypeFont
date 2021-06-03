#!/usr/bin/env node
const { spawn } = require('child_process')
const path = require('path')

const command = `cd ${path.resolve('dist')} && npm install --only=prod`
const pr = spawn(command, { shell: '/bin/bash' })

pr.stdout.on('data', data => process.send({ out: data }))
pr.stderr.on('data', data => process.send({ error: data }))
pr.on('close', code => (code !== 0 ? process.send({ code }) : process.send({ code })))
