/**
 * Next.js API Route - Chat Endpoint
 * Proxies chat requests to the Python backend
 */
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract message and other parameters
    const { message, conversation_id, userId, ...otherParams } = body;
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' }, 
        { status: 400 }
      );
    }

    // Prepare request payload for Python backend
    const backendPayload = {
      message: message.trim(),
      conversation_id: conversation_id,
      userId: userId,
      context: otherParams
    };

    console.log(`[Chat API] Forwarding request to Python backend: ${API_BASE_URL}/api/chat`);

    // Forward request to Python backend
    const backendResponse = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendPayload),
    });

    const backendData = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error(`[Chat API] Backend error:`, backendData);
      return NextResponse.json(
        { 
          success: false, 
          error: `Backend error: ${backendData.error || 'Unknown error'}`,
          details: backendData
        }, 
        { status: backendResponse.status }
      );
    }

    console.log(`[Chat API] Success, returning response from Python backend`);
    
    // Return the Python backend response directly (it already has the correct format)
    return NextResponse.json(backendData);

  } catch (error) {
    console.error('[Chat API] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}