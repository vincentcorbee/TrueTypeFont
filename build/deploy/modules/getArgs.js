#!/usr/bin/env node
const getArgs = (delim = '-', args = process.argv.slice(2)) => {
  args = Array.isArray(args) ? args : args.split(' ')

  let ch = 1

  const obj = {}
  const regKey = new RegExp(`^[^${delim}]`)
  const regDelim = new RegExp(`^${delim}`)
  const regComma = /,$/

  for (let i = 0, l = args.length; i < l; i += ch) {
    if (!regDelim.test(args[i])) {
      obj[args[i]] = true

      ch = 1
    } else {
      ch = 2

      const [key, val] = args.slice(i, i + ch)

      if (regKey.test(args[i + ch]) && i + ch < l) {
        obj[key.replace(regDelim, '')] = [val.replace(regComma, '')]

        while (regKey.test(args[i + ch]) && i + ch < l) {
          obj[key.replace(regDelim, '')].push(args[i + ch].replace(regComma, ''))
          ch += 1
        }
      } else if (val !== undefined && !regDelim.test(val)) {
        obj[key.replace(regDelim, '')] = val
      } else {
        obj[key.replace(regDelim, '')] = true

        ch = 1
      }
    }
  }
  return obj
}

module.exports = getArgs
