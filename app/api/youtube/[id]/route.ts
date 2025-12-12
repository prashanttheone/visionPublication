import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';

interface YouTubeVideo {
  id?: number;
  title: string;
  headline: string;
  video_id: string;
  thumbnail: string;
  duration: string;
  is_active?: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * GET - Fetch single YouTube video by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const videoId = parseInt(id, 10);

    if (isNaN(videoId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid video ID' },
        { status: 400 }
      );
    }

    const result = await query<YouTubeVideo>(
      'SELECT * FROM youtube_videos WHERE id = $1',
      [videoId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'YouTube video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching YouTube video:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch YouTube video' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update YouTube video by ID
 * Body: { title, headline, video_id, thumbnail, duration, is_active, display_order }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await getClient();

  try {
    const { id } = await params;
    const videoId = parseInt(id, 10);

    if (isNaN(videoId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid video ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, headline, video_id, thumbnail, duration, is_active, display_order } = body;

    // Dynamic query building for partial updates
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (title !== undefined && title !== null) {
      updates.push(`title = $${paramCount++}`);
      values.push(title.trim());
    }

    if (headline !== undefined && headline !== null) {
      updates.push(`headline = $${paramCount++}`);
      values.push(headline.trim());
    }

    if (video_id !== undefined && video_id !== null) {
      updates.push(`video_id = $${paramCount++}`);
      values.push(video_id.trim());
    }

    if (thumbnail !== undefined && thumbnail !== null) {
      updates.push(`thumbnail = $${paramCount++}`);
      values.push(thumbnail.trim());
    }

    if (duration !== undefined && duration !== null) {
      updates.push(`duration = $${paramCount++}`);
      values.push(duration.trim());
    }

    if (is_active !== undefined && is_active !== null) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }

    if (display_order !== undefined && display_order !== null) {
      updates.push(`display_order = $${paramCount++}`);
      values.push(display_order);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    updates.push(`updated_at = NOW()`);
    values.push(videoId);

    const result = await client.query<YouTubeVideo>(
      `UPDATE youtube_videos
       SET ${updates.join(', ')}
       WHERE id = $${paramCount + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'YouTube video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'YouTube video updated successfully',
    });
  } catch (error) {
    console.error('Error updating YouTube video:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update YouTube video' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

/**
 * DELETE - Delete YouTube video by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const videoId = parseInt(id, 10);

    if (isNaN(videoId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid video ID' },
        { status: 400 }
      );
    }

    const result = await query<{ id: number }>(
      'DELETE FROM youtube_videos WHERE id = $1 RETURNING id',
      [videoId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'YouTube video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'YouTube video deleted successfully',
      deletedId: videoId,
    });
  } catch (error) {
    console.error('Error deleting YouTube video:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete YouTube video' },
      { status: 500 }
    );
  }
}
