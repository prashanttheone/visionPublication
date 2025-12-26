import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';

interface YouTubeVideo {
  id?: number;
  title: string;
  headline: string;
  video_id: string;
  thumbnail: string;
  duration: string;
  description?: string;
  playlist_id?: number;
  video_order?: number;
  is_active?: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * GET - Fetch all YouTube videos
 * Query params:
 * - active: boolean (optional, default: false)
 * - orderBy: string (default: 'display_order')
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get('active') === 'true';

    let queryString = 'SELECT * FROM youtube_videos';
    const params: any[] = [];

    if (activeOnly) {
      queryString += ' WHERE is_active = true';
    }

    queryString += ' ORDER BY display_order ASC, created_at DESC';

    const result = await query<YouTubeVideo>(queryString, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch YouTube videos' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create new YouTube video
 * Body: { title, headline, video_id, thumbnail, duration }
 */
export async function POST(request: NextRequest) {
  const client = await getClient();

  try {
    const body = await request.json();
    const { title, headline, video_id, thumbnail, duration, description, playlist_id, video_order } = body;

    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!headline || !headline.trim()) {
      return NextResponse.json(
        { success: false, error: 'Headline is required' },
        { status: 400 }
      );
    }

    if (!video_id || !video_id.trim()) {
      return NextResponse.json(
        { success: false, error: 'Video ID is required' },
        { status: 400 }
      );
    }

    if (!thumbnail || !thumbnail.trim()) {
      return NextResponse.json(
        { success: false, error: 'Thumbnail URL is required' },
        { status: 400 }
      );
    }

    if (!duration || !duration.trim()) {
      return NextResponse.json(
        { success: false, error: 'Duration is required' },
        { status: 400 }
      );
    }

    // Get next display_order
    const orderResult = await client.query(
      'SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM youtube_videos'
    );
    const displayOrder = orderResult.rows[0].next_order;

    const result = await client.query<YouTubeVideo>(
      `INSERT INTO youtube_videos (title, headline, video_id, thumbnail, duration, description, playlist_id, video_order, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        title.trim(),
        headline.trim(),
        video_id.trim(),
        thumbnail.trim(),
        duration.trim(),
        description?.trim() || null,
        playlist_id || null,
        video_order || 0,
        displayOrder,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'YouTube video created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating YouTube video:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create YouTube video' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
