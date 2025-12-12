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

interface CreateSliderRequest {
  title: string;
  subtitle: string;
  description?: string;
  image_url: string;
  gradient?: string;
  book_id?: number | null;
}

// GET: Fetch all sliders (with optional active filter)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    let queryString = 'SELECT * FROM book_sliders';
    const params: any[] = [];

    if (activeOnly) {
      queryString += ' WHERE is_active = true';
    }

    queryString += ' ORDER BY display_order ASC, created_at DESC';

    const result = await query<BookSlider>(queryString, params);

    return NextResponse.json(
      {
        success: true,
        data: result.rows,
        count: result.rows.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching sliders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sliders' },
      { status: 500 }
    );
  }
}

// POST: Create a new slider
export async function POST(request: NextRequest) {
  const client = await getClient();

  try {
    const body = await request.json();
    const { title, subtitle, description, image_url, book_id } = body;

    // Validation
    if (!title || !subtitle || !image_url) {
      return NextResponse.json(
        { success: false, error: 'Title, subtitle, and image_url are required' },
        { status: 400 }
      );
    }

    // Get the next display_order
    const orderResult = await client.query(
      'SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM book_sliders'
    );
    const displayOrder = orderResult.rows[0].next_order;

    const queryString = `
      INSERT INTO book_sliders (title, subtitle, description, image_url, book_id, display_order)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await client.query<BookSlider>(queryString, [
      title,
      subtitle,
      description || null,
      image_url,
      book_id || null,
      displayOrder,
    ]);

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'Slider created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating slider:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create slider' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}