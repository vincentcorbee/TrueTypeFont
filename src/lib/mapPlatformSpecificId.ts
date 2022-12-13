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
        encoding: 'Unicode 1.0 semantics',
      },
      3: {
        encoding: `Unicode 2.0 and onwards semantics, Unicode BMP only ('cmap' subtable formats 0, 4, 6)`,
      },
    },
  }

  const platformSpecificID = identifiers[platform][id]

  if (platformSpecificID) {
    platformSpecificID.id = id
  }

  return platformSpecificID
}

export default mapPlatformSpecificId
