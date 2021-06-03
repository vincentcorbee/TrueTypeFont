const chalk = require('chalk')
const { spawn, fork } = require('child_process')
const Spinner = require('./Spinner')

module.exports = commands => {
  const executed = []
  const execute = commands =>
    new Promise((resolve, reject) => {
      const command = commands.shift()
      const error = []
      const out = []

      if (command) {
        const spinner = new Spinner()
        const match = command.match(/^fork/)

        let exitStatus = 1
        let pr

        spinner.setText(`%s Running: ${command}`)
        spinner.start()

        executed.push(command)

        if (match) {
          const args = command.replace(/([^\s]+)\s([^\s]+)/, '').trim()

          pr = fork(
            command.replace(match[0], '').replace(args, '').trim(),
            args.split(' ')
          )

          pr.on('message', data => {
            if (data.out) {
              out.push(Buffer.from(data.out.data))
            } else if (data.error) {
              error.push(Buffer.from(data.error.data))
            } else if (data.code) {
              exitStatus = data.code
            }
          })
        } else {
          pr = spawn(command, { shell: '/bin/bash' })

          pr.stdout.on('data', data => out.push(data))
          pr.stderr.on('data', data => error.push(data))
        }

        pr.on('close', code => {
          if (code !== 0) {
            spinner.failed(`Failed: ${chalk.red(command)}`)

            reject(Buffer.concat(error).toString())
          } else {
            spinner.success(`Done: ${chalk.green(command)}`)

            const data = Buffer.concat(out).toString()

            if (data) {
              process.stdout.write('Output:\n' + chalk.cyan(data) + '\n\n')
            }

            resolve(execute(commands))
          }
        })
      } else {
        resolve(
          `${chalk.green(`✔ Finished ${new Date()}`)}\n\nCommands run:\n${chalk.blue(
            '● ' + executed.join('\n● ')
          )}\n\n\n`
        )
      }
    })

  return execute(commands)
}
