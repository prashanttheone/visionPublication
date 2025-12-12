import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';

interface ContactInquiry {
  id?: number;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  is_read?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface AuthorApplication {
  id?: number;
  full_name: string;
  email: string;
  phone: string;
  qualification: string;
  specialization: string;
  experience: string;
  book_title: string;
  book_description: string;
  publishing_goal: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * GET - Fetch all form submissions (inquiries and applications)
 * Query params:
 * - type: 'contact' | 'author' (filter by type)
 * - status: string (for author applications)
 * - unread: boolean (for contact inquiries)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const unread = searchParams.get('unread') === 'true';

    let result;

    if (type === 'contact' || !type) {
      let queryString = 'SELECT * FROM contact_inquiries';
      const params: any[] = [];

      if (unread) {
        queryString += ' WHERE is_read = false';
      }

      queryString += ' ORDER BY created_at DESC';

      result = await query<ContactInquiry>(queryString, params);
    } else if (type === 'author') {
      let queryString = 'SELECT * FROM author_applications';
      const params: any[] = [];
      const conditions: string[] = [];

      if (status) {
        conditions.push(`status = $${params.length + 1}`);
        params.push(status);
      }

      if (conditions.length > 0) {
        queryString += ' WHERE ' + conditions.join(' AND ');
      }

      queryString += ' ORDER BY created_at DESC';

      result = await query<AuthorApplication>(queryString, params);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid type parameter' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error fetching form submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch form submissions' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create new form submission
 * Body: { type: 'contact' | 'author', ...formData }
 */
export async function POST(request: NextRequest) {
  const client = await getClient();

  try {
    const body = await request.json();
    const { type, ...formData } = body;

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Form type is required' },
        { status: 400 }
      );
    }

    if (type === 'contact') {
      const { full_name, email, subject, message } = formData;

      // Validation
      if (!full_name || !email || !subject || !message) {
        return NextResponse.json(
          { success: false, error: 'All fields are required' },
          { status: 400 }
        );
      }

      const result = await client.query<ContactInquiry>(
        `INSERT INTO contact_inquiries (full_name, email, subject, message)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [full_name.trim(), email.trim(), subject.trim(), message.trim()]
      );

      return NextResponse.json(
        {
          success: true,
          data: result.rows[0],
          message: 'Contact inquiry submitted successfully',
        },
        { status: 201 }
      );
    } else if (type === 'author') {
      const {
        full_name,
        email,
        phone,
        qualification,
        specialization,
        experience,
        book_title,
        book_description,
        publishing_goal,
      } = formData;

      // Validation
      if (
        !full_name ||
        !email ||
        !phone ||
        !qualification ||
        !specialization ||
        !experience ||
        !book_title ||
        !book_description ||
        !publishing_goal
      ) {
        return NextResponse.json(
          { success: false, error: 'All fields are required' },
          { status: 400 }
        );
      }

      const result = await client.query<AuthorApplication>(
        `INSERT INTO author_applications 
         (full_name, email, phone, qualification, specialization, experience, book_title, book_description, publishing_goal)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          full_name.trim(),
          email.trim(),
          phone.trim(),
          qualification.trim(),
          specialization.trim(),
          experience.trim(),
          book_title.trim(),
          book_description.trim(),
          publishing_goal.trim(),
        ]
      );

      return NextResponse.json(
        {
          success: true,
          data: result.rows[0],
          message: 'Author application submitted successfully',
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid form type' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error creating form submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create form submission' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
