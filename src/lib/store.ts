import fs from 'fs'
import path from 'path'

export interface ShelbyImage {
  blobId: string
  fileName: string
  mimeType: string
  sizeBytes: number
  uploadedAt: number
  expiresAt: number
  directUrl: string
  viewUrl: string
}

const DATA_DIR = path.join(process.cwd(), 'data')
const STORE    = path.join(DATA_DIR, 'images.json')

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

export function readStore(): ShelbyImage[] {
  try {
    ensure()
    if (!fs.existsSync(STORE)) return []
    const raw = fs.readFileSync(STORE, 'utf-8')
    return JSON.parse(raw) || []
  } catch { return [] }
}

function writeStore(imgs: ShelbyImage[]) {
  ensure()
  fs.writeFileSync(STORE, JSON.stringify(imgs, null, 2))
}

export function addImage(img: ShelbyImage) {
  const all = readStore()
  all.unshift(img)
  writeStore(all)
}
