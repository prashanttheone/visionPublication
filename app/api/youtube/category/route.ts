import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';

interface YouTubeCategory {
  id?: number;
  name: string;
  description?: string;
  is_active?: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export async function GET() {
  try {
    const result = await query<YouTubeCategory>(
      'SELECT * FROM youtube_categories WHERE is_active = true ORDER BY display_order ASC, name ASC'
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error fetching YouTube categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch YouTube categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const client = await getClient();

  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    const existingCheck = await client.query(
      'SELECT id FROM youtube_categories WHERE LOWER(name) = LOWER($1)',
      [name.trim()]
    );

    if (existingCheck.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Category already exists' },
        { status: 409 }
      );
    }

    const orderResult = await client.query(
      'SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM youtube_categories'
    );
    const displayOrder = orderResult.rows[0].next_order;

    const result = await client.query<YouTubeCategory>(
      `INSERT INTO youtube_categories (name, description, display_order, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`,
      [name.trim(), description?.trim() || null, displayOrder]
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'Category created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating YouTube category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create YouTube category' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function DELETE(request: NextRequest) {
  const client = await getClient();

  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const playlistCheck = await client.query(
      'SELECT COUNT(*) as count FROM youtube_playlists WHERE category = (SELECT name FROM youtube_categories WHERE id = $1)',
      [id]
    );

    if (parseInt(playlistCheck.rows[0].count) > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete category with associated playlists' },
        { status: 400 }
      );
    }

    await client.query('DELETE FROM youtube_categories WHERE id = $1', [id]);

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting YouTube category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete YouTube category' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
