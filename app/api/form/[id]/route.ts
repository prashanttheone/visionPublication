import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';

interface ContactInquiry {
  id: number;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthorApplication {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  qualification: string;
  specialization: string;
  experience: string;
  book_title: string;
  book_description: string;
  publishing_goal: string;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * GET - Fetch single form submission by ID
 * Query params:
 * - type: 'contact' | 'author' (required)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const submissionId = parseInt(id, 10);
    const type = request.nextUrl.searchParams.get('type');

    if (isNaN(submissionId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid submission ID' },
        { status: 400 }
      );
    }

    if (!type || (type !== 'contact' && type !== 'author')) {
      return NextResponse.json(
        { success: false, error: 'Type parameter must be "contact" or "author"' },
        { status: 400 }
      );
    }

    const tableName = type === 'contact' ? 'contact_inquiries' : 'author_applications';
    const result = await query(
      `SELECT * FROM ${tableName} WHERE id = $1`,
      [submissionId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching form submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch form submission' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update form submission
 * Query params:
 * - type: 'contact' | 'author' (required)
 * Body: { is_read?: boolean, status?: string }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await getClient();

  try {
    const { id } = await params;
    const submissionId = parseInt(id, 10);
    const type = request.nextUrl.searchParams.get('type');
    const body = await request.json();

    if (isNaN(submissionId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid submission ID' },
        { status: 400 }
      );
    }

    if (!type || (type !== 'contact' && type !== 'author')) {
      return NextResponse.json(
        { success: false, error: 'Type parameter must be "contact" or "author"' },
        { status: 400 }
      );
    }

    const tableName = type === 'contact' ? 'contact_inquiries' : 'author_applications';

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (type === 'contact' && body.is_read !== undefined) {
      updates.push(`is_read = $${paramCount++}`);
      values.push(body.is_read);
    }

    if (type === 'author' && body.status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(body.status);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    updates.push(`updated_at = NOW()`);
    values.push(submissionId);

    const result = await client.query(
      `UPDATE ${tableName}
       SET ${updates.join(', ')}
       WHERE id = $${paramCount + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Submission updated successfully',
    });
  } catch (error) {
    console.error('Error updating form submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update form submission' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

/**
 * DELETE - Delete form submission
 * Query params:
 * - type: 'contact' | 'author' (required)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const submissionId = parseInt(id, 10);
    const type = request.nextUrl.searchParams.get('type');

    if (isNaN(submissionId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid submission ID' },
        { status: 400 }
      );
    }

    if (!type || (type !== 'contact' && type !== 'author')) {
      return NextResponse.json(
        { success: false, error: 'Type parameter must be "contact" or "author"' },
        { status: 400 }
      );
    }

    const tableName = type === 'contact' ? 'contact_inquiries' : 'author_applications';
    const result = await query(
      `DELETE FROM ${tableName} WHERE id = $1 RETURNING id`,
      [submissionId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Submission deleted successfully',
      deletedId: submissionId,
    });
  } catch (error) {
    console.error('Error deleting form submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete form submission' },
      { status: 500 }
    );
  }
}
