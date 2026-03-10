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

export interface UploadResult {
  blobId: string
  directUrl: string
  viewUrl: string
  expiresAt: number
  sizeBytes: number
  mimeType: string
}

const RPC      = process.env.SHELBY_RPC_ENDPOINT   || 'https://api.shelbynet.shelby.xyz/shelby'
const NETWORK  = process.env.SHELBY_NETWORK         || 'shelbynet'
const DURATION = process.env.SHELBY_STORAGE_DURATION || '86400'
const ADDRESS  = process.env.SHELBY_ACCOUNT_ADDRESS  || ''
const KEY      = process.env.SHELBY_PRIVATE_KEY      || ''
const APIKEY   = process.env.SHELBY_API_KEY          || ''

export async function uploadImageToShelby(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<UploadResult> {
  if (!ADDRESS || ADDRESS.includes('YOUR_ADDRESS')) {
    throw new Error('SHELBY_ACCOUNT_ADDRESS not set in environment variables')
  }

  const safe     = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  const blobName = `images/${Date.now()}_${safe}`

  const headers: Record<string, string> = {
    'Content-Type':       mimeType,
    'Content-Length':     String(buffer.length),
    'X-Blob-Name':        blobName,
    'X-Storage-Duration': DURATION,
    'X-Shelby-Address':   ADDRESS,
  }
  if (KEY)    headers['X-Shelby-Key'] = KEY
  if (APIKEY) headers['X-API-Key']    = APIKEY

  const res = await fetch(`${RPC}/v1/blobs`, {
    method: 'PUT',
    headers,
    body: buffer,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Shelby [${res.status}]: ${text}`)
  }

  const data   = await res.json()
  const blobId = data.blobId ?? data.blob_id ?? data.id

  if (!blobId) throw new Error(`No blobId returned: ${JSON.stringify(data)}`)

  return {
    blobId,
    directUrl: `${RPC}/v1/blobs/${blobId}`,
    viewUrl:   `https://explorer.shelby.xyz/${NETWORK}/blob/${blobId}`,
    expiresAt: data.expiry ?? (Math.floor(Date.now() / 1000) + parseInt(DURATION)),
    sizeBytes: buffer.length,
    mimeType,
  }
}

export function getBlobUrl(blobId: string): string {
  return `${RPC}/v1/blobs/${blobId}`
}
