import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';

interface YouTubePlaylist {
  id?: number;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  video_count?: number;
  total_duration?: string;
  is_active?: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

interface PlaylistWithVideos extends YouTubePlaylist {
  videos?: any[];
}

/**
 * GET - Fetch all YouTube playlists
 * Query params:
 * - active: boolean (optional)
 * - includeVideos: boolean (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get('active') === 'true';
    const includeVideos = searchParams.get('includeVideos') === 'true';

    let queryString = 'SELECT * FROM youtube_playlists';
    const params: any[] = [];

    if (activeOnly) {
      queryString += ' WHERE is_active = true';
    }

    queryString += ' ORDER BY display_order ASC, created_at DESC';

    const result = await query<YouTubePlaylist>(queryString, params);
    const playlists = result.rows;

    // Include videos if requested
    if (includeVideos && playlists.length > 0) {
      const playlistIds = playlists.map(p => p.id);
      const videosResult = await query(
        `SELECT * FROM youtube_videos 
         WHERE playlist_id = ANY($1)
         ORDER BY playlist_id, video_order ASC`,
        [playlistIds]
      );

      const playlistsWithVideos: PlaylistWithVideos[] = playlists.map(playlist => ({
        ...playlist,
        videos: videosResult.rows.filter((v: any) => v.playlist_id === playlist.id),
      }));

      return NextResponse.json({
        success: true,
        data: playlistsWithVideos,
        count: playlists.length,
      });
    }

    return NextResponse.json({
      success: true,
      data: playlists,
      count: playlists.length,
    });
  } catch (error) {
    console.error('Error fetching YouTube playlists:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch YouTube playlists' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create new YouTube playlist
 */
export async function POST(request: NextRequest) {
  const client = await getClient();

  try {
    const body = await request.json();
    const { title, description, thumbnail, category, total_duration, is_active } = body;

    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        { success: false, error: 'Description is required' },
        { status: 400 }
      );
    }

    if (!thumbnail || !thumbnail.trim()) {
      return NextResponse.json(
        { success: false, error: 'Thumbnail URL is required' },
        { status: 400 }
      );
    }

    if (!category || !category.trim()) {
      return NextResponse.json(
        { success: false, error: 'Category is required' },
        { status: 400 }
      );
    }

    // Get next display_order
    const orderResult = await client.query(
      'SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM youtube_playlists'
    );
    const displayOrder = orderResult.rows[0].next_order;

    const result = await client.query<YouTubePlaylist>(
      `INSERT INTO youtube_playlists (title, description, thumbnail, category, total_duration, is_active, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        title.trim(),
        description.trim(),
        thumbnail.trim(),
        category.trim(),
        total_duration || null,
        is_active !== false,
        displayOrder,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'YouTube playlist created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating YouTube playlist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create YouTube playlist' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

/**
 * PUT - Update YouTube playlist
 */
export async function PUT(request: NextRequest) {
  const client = await getClient();

  try {
    const body = await request.json();
    const { id, title, description, thumbnail, category, total_duration, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Playlist ID is required' },
        { status: 400 }
      );
    }

    const result = await client.query<YouTubePlaylist>(
      `UPDATE youtube_playlists
       SET title = $1, description = $2, thumbnail = $3, category = $4, 
           total_duration = $5, is_active = $6
       WHERE id = $7
       RETURNING *`,
      [
        title.trim(),
        description.trim(),
        thumbnail.trim(),
        category.trim(),
        total_duration || null,
        is_active !== false,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Playlist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'YouTube playlist updated successfully',
    });
  } catch (error) {
    console.error('Error updating YouTube playlist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update YouTube playlist' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

/**
 * DELETE - Delete YouTube playlist
 */
export async function DELETE(request: NextRequest) {
  const client = await getClient();

  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Playlist ID is required' },
        { status: 400 }
      );
    }

    await client.query('DELETE FROM youtube_playlists WHERE id = $1', [id]);

    return NextResponse.json({
      success: true,
      message: 'YouTube playlist deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting YouTube playlist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete YouTube playlist' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
