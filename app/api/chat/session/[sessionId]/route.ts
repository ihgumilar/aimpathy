import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;
    
    const response = await fetch(`http://localhost:8000/api/chat/session/${sessionId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete session');
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Error in session deletion:', error);
    return new NextResponse(null, { status: 500 });
  }
} 