import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Get query parameters
  const { searchParams } = new URL(request.url);
  const chatbotId = searchParams.get('chatbotId');

  if (!chatbotId) {
    return NextResponse.json(
      { error: 'Missing chatbotId parameter' }, 
      { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Accept'
        }
      }
    );
  }

  // Get API URL from environment variable
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8234';

  // Return widget configuration including API URL
  return NextResponse.json(
    {
      chatbotId,
      apiUrl,
      version: '1.0.0'
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept'
      }
    }
  );
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept'
      }
    }
  );
} 