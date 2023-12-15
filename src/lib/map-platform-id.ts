const mapPlatformId = (id: number) => {
  const platformIds: any = {
    0: {
      platform: 'Unicode',
      desc: 'Indicates Unicode version',
    },
    1: {
      platform: 'Macintosh',
      desc: 'QuickDraw Script Manager code',
    },
    2: {
      platform: 'ISO',
      desc: 'ISO encoding (deprecated)',
    },
    3: {
      platform: 'Microsoft',
      desc: 'Microsoft encoding',
    },
  }

  const platformId = platformIds[id] ?? {}

  platformId.id = id

  return platformId
}

export default mapPlatformId
