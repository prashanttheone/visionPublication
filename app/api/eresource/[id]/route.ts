import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';

// Types
interface EResourceBook {
  id?: number;
  course_id: number;
  semester_id: number;
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

interface UpdateEResourceRequest {
  book: EResourceBook;
  chapters: EResourceChapter[];
}

/**
 * GET - Fetch single e-resource book with chapters
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookId = parseInt(id);

    if (isNaN(bookId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    // Get book with course and semester info
    const bookResult = await query<EResourceBook & { course_name: string; semester_name: string }>(
      `SELECT eb.*, c.name as course_name, s.description as semester_name
       FROM eresource_books eb
       JOIN courses c ON eb.course_id = c.id
       JOIN semesters s ON eb.semester_id = s.id
       WHERE eb.id = $1`,
      [bookId]
    );

    if (bookResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'E-resource book not found' },
        { status: 404 }
      );
    }

    const book = bookResult.rows[0];

    // Get chapters
    const chaptersResult = await query<EResourceChapter>(
      'SELECT * FROM eresource_chapters WHERE eresource_book_id = $1 ORDER BY chapter_number',
      [bookId]
    );

    return NextResponse.json({
      success: true,
      data: {
        ...book,
        chapters: chaptersResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching e-resource:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch e-resource',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update e-resource book and chapters
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await getClient();

  try {
    const { id } = await params;
    const bookId = parseInt(id);

    if (isNaN(bookId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    const body: UpdateEResourceRequest = await request.json();
    const { book, chapters = [] } = body;

    // Validation
    if (!book.book_name || !book.book_name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Book name is required' },
        { status: 400 }
      );
    }

    // Check if book exists
    const existingBook = await client.query(
      'SELECT id FROM eresource_books WHERE id = $1',
      [bookId]
    );

    if (existingBook.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'E-resource book not found' },
        { status: 404 }
      );
    }

    // Start transaction
    await client.query('BEGIN');

    // Update book
    const bookResult = await client.query<EResourceBook>(
      `UPDATE eresource_books 
       SET book_name = $1, description = $2, course_id = $3, semester_id = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [book.book_name.trim(), book.description || '', book.course_id, book.semester_id, bookId]
    );

    const updatedBook = bookResult.rows[0];

    // Delete existing chapters
    await client.query('DELETE FROM eresource_chapters WHERE eresource_book_id = $1', [bookId]);

    let newChapters: EResourceChapter[] = [];

    // Insert new chapters
    if (chapters.length > 0) {
      const chapterInserts = chapters.map(chapter =>
        client.query<EResourceChapter>(
          `INSERT INTO eresource_chapters (eresource_book_id, chapter_number, chapter_name, doc_link, created_at, updated_at)
           VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           RETURNING *`,
          [bookId, chapter.chapter_number, chapter.chapter_name, chapter.doc_link || null]
        )
      );

      const chapterResults = await Promise.all(chapterInserts);
      newChapters = chapterResults.map(result => result.rows[0]);
    }

    // Commit transaction
    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      message: 'E-resource book updated successfully',
      data: {
        book: updatedBook,
        chapters: newChapters
      }
    });
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');

    console.error('Error updating e-resource:', error);

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
        error: 'Failed to update e-resource',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

/**
 * DELETE - Delete e-resource book (cascades to chapters)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookId = parseInt(id);

    if (isNaN(bookId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    // Check if book exists
    const existingBook = await query(
      'SELECT id FROM eresource_books WHERE id = $1',
      [bookId]
    );

    if (existingBook.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'E-resource book not found' },
        { status: 404 }
      );
    }

    // Delete book (chapters cascade automatically)
    await query('DELETE FROM eresource_books WHERE id = $1', [bookId]);

    return NextResponse.json({
      success: true,
      message: 'E-resource book deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting e-resource:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete e-resource',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
