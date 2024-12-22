import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_URL = 'http://localhost:8000';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Forward the file to FastAPI
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        const response = await fetch(`${FASTAPI_URL}/api/upload`, {
            method: 'POST',
            body: uploadFormData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to upload PDF');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { error: 'Failed to upload and index PDF' },
            { status: 500 }
        );
    }
} 