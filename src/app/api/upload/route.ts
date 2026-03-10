import { NextRequest, NextResponse } from 'next/server'
import { uploadImageToShelby } from '@/lib/shelby'
import { addImage } from '@/lib/store'

const ALLOWED = ['image/jpeg','image/png','image/gif','image/webp','image/svg+xml']
const MAX     = 10 * 1024 * 1024

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('image') as File | null

    if (!file)                        return err('No file provided', 400)
    if (!ALLOWED.includes(file.type)) return err(`Type "${file.type}" not allowed`, 400)
    if (file.size > MAX)              return err('File too large (max 10MB)', 400)

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await uploadImageToShelby(buffer, file.name, file.type)

    const record = {
      blobId:     result.blobId,
      fileName:   file.name,
      mimeType:   file.type,
      sizeBytes:  file.size,
      uploadedAt: Math.floor(Date.now() / 1000),
      expiresAt:  result.expiresAt,
      directUrl:  result.directUrl,
      viewUrl:    result.viewUrl,
    }

    addImage(record)
    return NextResponse.json({ success: true, image: record })

  } catch (e: any) {
    console.error(e)
    return err(e.message || 'Upload failed', 500)
  }
}

function err(msg: string, status: number) {
  return NextResponse.json({ error: msg }, { status })
}
