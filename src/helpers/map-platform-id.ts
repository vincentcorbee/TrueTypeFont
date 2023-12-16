import { PlatformId } from '../types'

const mapPlatformId = (id: number): PlatformId => {
  switch (id) {
    case 0:
      return {
        id: 0,
        platform: 'Unicode',
        desc: 'Indicates Unicode version',
      }
    case 1:
      return {
        id: 1,
        platform: 'Macintosh',
        desc: 'QuickDraw Script Manager code',
      }
    case 2:
      return {
        id: 2,
        platform: 'ISO',
        desc: 'ISO encoding (deprecated)',
      }
    case 3:
      return {
        id: 3,
        platform: 'Microsoft',
        desc: 'Microsoft encoding',
      }
    default:
      return { id, platform: 'Unknown', desc: '' }
  }
}

export default mapPlatformId
