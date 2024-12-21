import { NextResponse } from 'next/server';

// Add type for params
type Params = {
  params: {
    sessionId: string;
  };
};

export async function DELETE(request: Request, { params }: Params) {
  try {
    // Access sessionId directly since we've properly typed it
    const response = await fetch(`http://localhost:8000/api/chat/session/${params.sessionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return new NextResponse(null, { status: response.status });
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Error in session deletion:', error);
    return new NextResponse(null, { status: 500 });
  }
} 