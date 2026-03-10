import { NextResponse } from 'next/server'
import { readStore } from '@/lib/store'

export async function GET() {
  try {
    return NextResponse.json({ success: true, images: readStore() })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
