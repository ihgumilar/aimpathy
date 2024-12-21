import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = await fetch('http://localhost:8000/api/reset-index', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return new NextResponse(null, { status: response.status });
    
  } catch (error) {
    console.error('Error in reset-index API route:', error);
    return new NextResponse(null, { status: 500 });
  }
} 