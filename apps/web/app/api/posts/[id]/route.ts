import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Proxy request to backend API
    const backendUrl = `http://localhost:8000/posts/${id}`;
    const response = await fetch(backendUrl);

    if (!response.ok) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
