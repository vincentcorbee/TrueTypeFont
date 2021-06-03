#!/usr/bin/env node
const { spawn } = require('child_process')
const getArgs = require('./modules/getArgs')

const args = getArgs()
const remote = args.r
const remoteDirectory = args.d
const zipname = args.z
const command = `ssh ${remote} 'unzip -o ${zipname}.zip -d ${remoteDirectory}; rm ${zipname}.zip; cd ${remoteDirectory};exit'`
const pr = spawn(command, { shell: '/bin/bash' })

pr.stdout.on('data', out => process.send({ out }))
pr.stderr.on('data', error => process.send({ error }))
pr.on('close', code => (code !== 0 ? process.send({ code }) : process.send({ code })))
