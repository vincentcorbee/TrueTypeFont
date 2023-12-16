const mapPlatformSpecificId = (platform: string, id: number) => {
  const identifiers: any = {
    Macintosh: {
      0: {
        encoding: 'Roman',
      },
      1: {
        encoding: 'Japanese',
      },
      2: {
        encoding: 'Traditional Chinese',
      },
      3: {
        encoding: 'Korean',
      },
      4: {
        encoding: 'Arabic',
      },
      5: {
        encoding: 'Hebrew',
      },
      6: {
        encoding: 'Greek',
      },
      7: {
        encoding: 'Russian',
      },
      8: { encoding: 'RSymbol' },
      9: { encoding: 'Devanagari' },
      10: { encoding: 'Gurmukhi' },
      11: { encoding: 'Gujarati' },
      12: { encoding: 'Oriya' },
      13: { encoding: 'Bengali' },
      14: { encoding: 'Tamil' },
      15: { encoding: 'Telugu' },
      16: { encoding: 'Kannada' },
      17: { encoding: 'Malayalam' },
      18: { encoding: 'Sinhalese' },
      19: { encoding: 'Burmese' },
      20: { encoding: 'Khmer' },
      21: { encoding: 'Thai' },
      22: { encoding: 'Laotian' },
      23: { encoding: 'Georgian' },
      24: { encoding: 'Armenian' },
      25: { encoding: 'Simplified Chinese' },
      26: { encoding: 'Tibetan' },
      27: { encoding: 'Mongolian' },
      28: { encoding: 'Geez' },
      29: { encoding: 'Slavic' },
      30: { encoding: 'Vietnamese' },
      31: { encoding: 'Sindhi' },
      32: { encoding: '(Uninterpreted)' },
    },
    Microsoft: {
      0: {
        encoding: 'Symbol',
      },
      1: {
        encoding: 'Unicode BMP',
      },
      3: {
        encoding: 'PRC',
      },
      10: {
        encoding: 'Unicode full repertoire',
      },
    },
    Unicode: {
      0: {
        encoding: 'Unicode 1.0 semantics (deprecated)',
      },
      1: {
        encoding: 'Unicode 1.1 semantics (deprecated)',
      },
      2: {
        encoding: 'ISO/IEC 10646 semantics (deprecated)',
      },
      3: {
        encoding: `Unicode 2.0 and onwards semantics, Unicode BMP only ('cmap' subtable formats 0, 4, 6)`,
      },
      4: {
        encoding: `Unicode 2.0 and onwards semantics, Unicode full repertoire`,
      },
      5: {
        encoding: `Unicode Variation Sequences—for use with subtable format 14`,
      },
      6: {
        encoding: `Unicode full repertoire—for use with subtable format 13`,
      },
    },
  }

  const platformSpecificID = identifiers[platform][id] ?? {}

  platformSpecificID.id = id

  return platformSpecificID
}

export default mapPlatformSpecificId
