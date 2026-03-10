const RPC      = process.env.SHELBY_RPC_ENDPOINT      || 'https://api.shelbynet.shelby.xyz/shelby'
const NETWORK  = process.env.SHELBY_NETWORK            || 'shelbynet'
const DURATION = process.env.SHELBY_STORAGE_DURATION   || '86400'
const ADDRESS  = process.env.SHELBY_ACCOUNT_ADDRESS    || ''
const PRIVKEY  = process.env.SHELBY_PRIVATE_KEY        || ''
const APIKEY   = process.env.SHELBY_API_KEY            || ''

export interface UploadResult {
  blobId: string; directUrl: string; viewUrl: string
  expiresAt: number; sizeBytes: number; mimeType: string
}

export interface ShelbyImage {
  blobId: string; fileName: string; mimeType: string
  sizeBytes: number; uploadedAt: number; expiresAt: number
  directUrl: string; viewUrl: string
}

function validate() {
  if (!ADDRESS || ADDRESS.includes('YOUR_ADDRESS'))
    throw new Error('SHELBY_ACCOUNT_ADDRESS not set in Vercel environment variables')
  if (!PRIVKEY || PRIVKEY.includes('YOUR_KEY'))
    throw new Error('SHELBY_PRIVATE_KEY not set in Vercel environment variables')
}

async function createSession(): Promise<string> {
  console.log(`🔑 Creating Shelby session for ${ADDRESS}`)
  const res = await fetch(`${RPC}/sessions/createSession`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(APIKEY ? { 'X-API-Key': APIKEY } : {}),
    },
    body: JSON.stringify({
      accountAddress: ADDRESS,
      privateKey:     PRIVKEY,
      durationSecs:   parseInt(DURATION),
    }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Session failed [${res.status}]: ${text}`)
  }
  const data  = await res.json()
  const token = data.sessionToken ?? data.token ?? data.session ?? data.accessToken
  if (!token) throw new Error(`No session token: ${JSON.stringify(data)}`)
  console.log('✅ Session created')
  return token
}

export async function uploadImageToShelby(
  buffer: Buffer, fileName: string, mimeType: string
): Promise<UploadResult> {
  validate()
  const sessionToken = await createSession()
  const safe     = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  const blobName = `images/${Date.now()}_${safe}`
  console.log(`📤 Uploading: ${blobName} (${buffer.length} bytes)`)
  const res = await fetch(`${RPC}/storage/blobs`, {
    method: 'PUT',
    headers: {
      'Content-Type':       mimeType,
      'Content-Length':     String(buffer.length),
      'X-Session-Token':    sessionToken,
      'X-Blob-Name':        blobName,
      'X-Storage-Duration': DURATION,
      ...(APIKEY ? { 'X-API-Key': APIKEY } : {}),
    },
    body: buffer,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Upload failed [${res.status}]: ${text}`)
  }
  const data   = await res.json()
  const blobId = data.blobId ?? data.blob_id ?? data.id
  if (!blobId) throw new Error(`No blobId: ${JSON.stringify(data)}`)
  console.log(`✅ Blob ID: ${blobId}`)
  return {
    blobId,
    directUrl: getBlobUrl(blobId),
    viewUrl:   `https://explorer.shelby.xyz/${NETWORK}/blob/${blobId}`,
    expiresAt: data.expiry ?? (Math.floor(Date.now() / 1000) + parseInt(DURATION)),
    sizeBytes: buffer.length,
    mimeType,
  }
}

export function getBlobUrl(blobId: string): string {
  return `${RPC}/storage/blobs/${blobId}`
}