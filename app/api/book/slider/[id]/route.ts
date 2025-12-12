import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';

interface BookSlider {
  id: number;
  title: string;
  subtitle: string;
  description: string | null;
  image_url: string;
  book_id: number | null;
  is_active: boolean;
  display_order: number;
  created_at: Date;
  updated_at: Date;
}

// GET: Fetch a single slider by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sliderId = parseInt(id, 10);

    if (isNaN(sliderId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid slider ID' },
        { status: 400 }
      );
    }

    const result = await query<BookSlider>(
      'SELECT * FROM book_sliders WHERE id = $1',
      [sliderId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Slider not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching slider:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch slider' },
      { status: 500 }
    );
  }
}

// PUT: Update a slider
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await getClient();

  try {
    const { id } = await params;
    const sliderId = parseInt(id, 10);

    if (isNaN(sliderId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid slider ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, subtitle, description, image_url, book_id, is_active, display_order } = body;

    // Check if slider exists
    const existingResult = await client.query(
      'SELECT id FROM book_sliders WHERE id = $1',
      [sliderId]
    );

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Slider not found' },
        { status: 404 }
      );
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (subtitle !== undefined) {
      updates.push(`subtitle = $${paramCount++}`);
      values.push(subtitle);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (image_url !== undefined) {
      updates.push(`image_url = $${paramCount++}`);
      values.push(image_url);
    }
    if (book_id !== undefined) {
      updates.push(`book_id = $${paramCount++}`);
      values.push(book_id);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }
    if (display_order !== undefined) {
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
    values.push(sliderId);

    const queryString = `
      UPDATE book_sliders
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await client.query<BookSlider>(queryString, values);

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'Slider updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating slider:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update slider' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// DELETE: Delete a slider
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sliderId = parseInt(id, 10);

    if (isNaN(sliderId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid slider ID' },
        { status: 400 }
      );
    }

    const result = await query<{ id: number }>(
      'DELETE FROM book_sliders WHERE id = $1 RETURNING id',
      [sliderId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Slider not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Slider deleted successfully',
        deletedId: sliderId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting slider:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete slider' },
      { status: 500 }
    );
  }
}