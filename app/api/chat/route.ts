import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_URL = 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const message = formData.get('message') as string;
    let sessionId = formData.get('sessionId') as string;

    if (!sessionId) {
      return NextResponse.json({
        response: 'Please upload a PDF file first',
      });
    }

    // Query with streaming
    const queryFormData = new FormData();
    queryFormData.append('session_id', sessionId);
    queryFormData.append('query', message);

    const response = await fetch(`${FASTAPI_URL}/api/query`, {
      method: 'POST',
      body: queryFormData,
    });

    if (!response.ok) {
      throw new Error('Failed to query PDF');
    }

    // Return the stream
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Session-Id': sessionId,
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error processing chat request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 