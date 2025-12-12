import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/db';

/**
 * Health check endpoint
 * GET /api/health
 */
export async function GET() {
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: 'Database connection successful',
        status: 'ok'
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Database connection failed',
          status: 'error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      },
      { status: 500 }
    );
  }
}
