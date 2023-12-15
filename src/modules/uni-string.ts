const uniString = (str: string) => {
	// String.prototype.normalize - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
	const toHex = (c: number | string) => {
    c = c.toString(16)

    while(c.length < 4) {
     c = '0' + c
    }

    return c
  }

  const l = str.length
	let string = ''
  let length = 0
  let arr: any[] = []

  for (let i = 0; i < l; i+= 1) {
    let c = str[i].charCodeAt(0)
    let c2 = str[i + 1] ? str[i + 1].charCodeAt(0) : 0
    let pairs = []

    // Combining marks
    if (c2 >= 0x0300 && c2 <= 0x036F) {
      pairs.push(toHex(c))


      do {
      	pairs.push(toHex(c2))

        i += 1

        c2 = str[i + 1] ? str[i + 1].charCodeAt(0) : 0
      } while (c2 >= 0x0300 && c2 <= 0x036F)

      const norm = pairs.map(c => JSON.parse('"\\u' + `${c}"`)).join('').normalize()
      let hex = [toHex(norm.charCodeAt(0))]

      if (norm.length > 1) {
        let i = 1

        while (i < norm.length) {
        	hex.push(toHex(norm.charCodeAt(i)))
          i += 1
        }
      }

      arr.push({ type: 'combiningMark', hex })
    }

    // Surrogate pairs
    else if (c >= 0xD800 && c <= 0xDBFF) {
      pairs.push(toHex(c))

      if (c2 >= 0xDC00 && c2 <= 0xDFFF) {
        pairs.push(toHex(c2))
        i += 1
      }

      if (pairs.length === 2) {
      	arr.push({
        	type: 'surrogate',
          hex: toHex((c - 0xD800) * 0x400 + c2 - 0xDC00 + 0x10000)
        })
      }
    }

    else {
    	arr.push({ type: 'char', hex: toHex(c) })
    }

    length += 1

    string += pairs.length ? pairs.map(c => JSON.parse('"\\u' + `${c}"`)).join('') : str[i]
  }

  return {
  	codePointAt: (index: number) => {
    	const c = arr[index]
      return !c ? 0 : Array.isArray(c.hex) ? c.hex.length > 1 ? c.hex.map((v: string) => parseInt(v, 16)) : parseInt(c.hex[0], 16) : parseInt(c.hex, 16)
    },
    charAt: (index: number) => {

      const c = arr[index]

      if (!c) {
        return '\u0000'
      }

      const point = Array.isArray(c.hex) ? c.hex.map((v:string) => parseInt(v, 16)) : parseInt(c.hex, 16)
      let o = ''

      if (c.type === 'surrogate') {
      	// High and low surragte pair formula
      	const h = toHex(Math.floor((point - 0x10000) / 0x400) + 0xD800);
  			const l = toHex((point - 0x10000) % 0x400 + 0xDC00);

        o = JSON.parse(`"\\u${h}\\u${l}"`)
      }

      else if (c.type === 'combiningMark') {
      	if (point.length > 1) {
        	o = point.map((p:number) => JSON.parse('"\\u' + `${toHex(p)}"`)).join('')
        }

        else {
        	o = String.fromCharCode(point)
        }
      }

      else {
      	o = String.fromCharCode(point)
      }

      return o

    },
  	string,
    length
  }
}

export default uniString