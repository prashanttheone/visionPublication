import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';

// Types
interface EResourceBook {
  id?: number;
  course_id: number;
  academic_period_id: number;
  book_name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

interface EResourceChapter {
  id?: number;
  eresource_book_id?: number;
  chapter_number: number;
  chapter_name: string;
  doc_link?: string;
  created_at?: string;
  updated_at?: string;
}

interface CreateEResourceRequest {
  book: EResourceBook;
  chapters: EResourceChapter[];
}

/**
 * GET - Fetch all e-resource books with chapters
 * Query params:
 * - courseId: number (optional) - filter by course
 * - semesterId: number (optional) - filter by semester
 * - includeChapters: boolean (default: true)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');
    const academicPeriodId = searchParams.get('academicPeriodId') || searchParams.get('semesterId');
    const includeChapters = searchParams.get('includeChapters') !== 'false';

    // Build query for e-resource books
    let booksQuery = `
      SELECT eb.*, c.name as course_name, ap.description as semester_name, ap.label as period_label
      FROM eresource_books eb
      JOIN courses c ON eb.course_id = c.id
      JOIN academic_periods ap ON eb.academic_period_id = ap.id
    `;
    const queryParams: any[] = [];
    const conditions: string[] = [];

    if (courseId) {
      conditions.push(`eb.course_id = $${queryParams.length + 1}`);
      queryParams.push(parseInt(courseId));
    }

    if (academicPeriodId) {
      conditions.push(`eb.academic_period_id = $${queryParams.length + 1}`);
      queryParams.push(parseInt(academicPeriodId));
    }

    if (conditions.length > 0) {
      booksQuery += ' WHERE ' + conditions.join(' AND ');
    }

    booksQuery += ' ORDER BY c.name, ap.period_number, eb.book_name';

    const booksResult = await query<EResourceBook & { course_name: string; semester_name: string; period_label: string }>(booksQuery, queryParams);
    const books = booksResult.rows;

    // If chapters should be included, fetch them
    if (includeChapters && books.length > 0) {
      const chaptersResult = await query<EResourceChapter>(
        `SELECT * FROM eresource_chapters 
         WHERE eresource_book_id = ANY($1)
         ORDER BY eresource_book_id, chapter_number`,
        [books.map(b => b.id)]
      );

      // Group chapters by book_id
      const chaptersByBook: { [key: number]: EResourceChapter[] } = {};
      chaptersResult.rows.forEach(chapter => {
        if (!chaptersByBook[chapter.eresource_book_id!]) {
          chaptersByBook[chapter.eresource_book_id!] = [];
        }
        chaptersByBook[chapter.eresource_book_id!].push(chapter);
      });

      // Attach chapters to books
      const booksWithChapters = books.map(book => ({
        ...book,
        chapters: chaptersByBook[book.id!] || []
      }));

      return NextResponse.json({
        success: true,
        data: booksWithChapters,
        count: books.length
      });
    }

    return NextResponse.json({
      success: true,
      data: books,
      count: books.length
    });
  } catch (error) {
    console.error('Error fetching e-resources:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch e-resources',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Create new e-resource book with chapters
 * Body: { book: EResourceBook, chapters: EResourceChapter[] }
 */
export async function POST(request: NextRequest) {
  const client = await getClient();

  try {
    const body: CreateEResourceRequest = await request.json();
    const { book, chapters = [] } = body;

    // Validation
    if (!book.book_name || !book.book_name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Book name is required' },
        { status: 400 }
      );
    }

    if (!book.course_id || (!book.academic_period_id && !book.semester_id)) {
      return NextResponse.json(
        { success: false, error: 'Course and period/semester are required' },
        { status: 400 }
      );
    }

    const periodId = book.academic_period_id || book.semester_id;

    // Validate period belongs to course
    const periodCheck = await client.query(
      'SELECT id FROM academic_periods WHERE id = $1 AND course_id = $2',
      [periodId, book.course_id]
    );

    if (periodCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Selected period does not belong to the selected course' },
        { status: 400 }
      );
    }

    // Start transaction
    await client.query('BEGIN');

    // Insert e-resource book
    const bookResult = await client.query<EResourceBook>(
      `INSERT INTO eresource_books (course_id, academic_period_id, book_name, description, created_at, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [book.course_id, periodId, book.book_name.trim(), book.description || '']
    );

    const newBook = bookResult.rows[0];
    let newChapters: EResourceChapter[] = [];

    // Insert chapters if provided
    if (chapters.length > 0) {
      const chapterInserts = chapters.map(chapter =>
        client.query<EResourceChapter>(
          `INSERT INTO eresource_chapters (eresource_book_id, chapter_number, chapter_name, doc_link, created_at, updated_at)
           VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           RETURNING *`,
          [newBook.id, chapter.chapter_number, chapter.chapter_name, chapter.doc_link || null]
        )
      );

      const chapterResults = await Promise.all(chapterInserts);
      newChapters = chapterResults.map(result => result.rows[0]);
    }

    // Commit transaction
    await client.query('COMMIT');

    return NextResponse.json(
      {
        success: true,
        message: 'E-resource book created successfully',
        data: {
          book: newBook,
          chapters: newChapters
        }
      },
      { status: 201 }
    );
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');

    console.error('Error creating e-resource:', error);

    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        {
          success: false,
          error: 'An e-resource book with this name already exists for this course/semester'
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create e-resource',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
