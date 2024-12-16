import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('document') as File

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  // Here you would typically process the file, extract text, and store it
  // For this example, we'll just log the file name
  console.log(`Received file: ${file.name}`)

  return NextResponse.json({ message: 'File uploaded successfully' })
}

