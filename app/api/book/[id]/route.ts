import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';

// Types
interface Book {
  id?: number;
  name: string;
  author: string;
  isbn: string;
  edition: string;
  description: string;
  image_url: string;
  actual_price: number;
  offer_price: number;
  stock_quantity: number;
  in_stock: boolean;
  rating: number;
  reviews_count: number;
  category: string;
  created_at?: string;
  updated_at?: string;
}

interface BookCourseMap {
  id?: number;
  book_id: number;
  course_id: number;
  semester_id: number;
  is_required: boolean;
  is_recommended: boolean;
}

interface UpdateBookRequest {
  book: Book;
  courseMappings?: BookCourseMap[];
}

/**
 * GET - Fetch single book by ID with course mappings
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookId = parseInt(params.id);

    if (isNaN(bookId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    // Fetch book
    const bookResult = await query<Book>(
      'SELECT * FROM books WHERE id = $1',
      [bookId]
    );

    if (bookResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Book not found' },
        { status: 404 }
      );
    }

    const book = bookResult.rows[0];

    // Fetch course mappings
    const mappingsResult = await query<BookCourseMap>(
      'SELECT * FROM book_course_map WHERE book_id = $1 ORDER BY course_id, semester_id',
      [bookId]
    );

    return NextResponse.json({
      success: true,
      data: {
        ...book,
        courseMappings: mappingsResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching book:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch book',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update book and course mappings
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await getClient();

  try {
    const bookId = parseInt(params.id);

    if (isNaN(bookId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    const body: UpdateBookRequest = await request.json();
    const { book, courseMappings = [] } = body;

    // Validation
    if (!book.name || !book.name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Book name is required' },
        { status: 400 }
      );
    }

    if (book.offer_price > book.actual_price) {
      return NextResponse.json(
        { success: false, error: 'Offer price cannot exceed actual price' },
        { status: 400 }
      );
    }

    // Check if book exists
    const existingBook = await client.query(
      'SELECT id FROM books WHERE id = $1',
      [bookId]
    );

    if (existingBook.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Book not found' },
        { status: 404 }
      );
    }

    // Start transaction
    await client.query('BEGIN');

    // Update book
    const bookResult = await client.query<Book>(
      `UPDATE books 
       SET name = $1, author = $2, isbn = $3, edition = $4, description = $5, image_url = $6,
           actual_price = $7, offer_price = $8, stock_quantity = $9, in_stock = $10,
           rating = $11, reviews_count = $12, category = $13, updated_at = CURRENT_TIMESTAMP
       WHERE id = $14
       RETURNING *`,
      [
        book.name.trim(),
        book.author.trim(),
        book.isbn || null,
        book.edition || null,
        book.description || null,
        book.image_url || null,
        book.actual_price,
        book.offer_price,
        book.stock_quantity,
        book.in_stock,
        book.rating || 0,
        book.reviews_count || 0,
        book.category || null,
        bookId
      ]
    );

    const updatedBook = bookResult.rows[0];

    // Delete existing course mappings
    await client.query(
      'DELETE FROM book_course_map WHERE book_id = $1',
      [bookId]
    );

    // Insert new course mappings
    let newMappings: BookCourseMap[] = [];
    if (courseMappings.length > 0) {
      const mappingInserts = courseMappings.map(mapping =>
        client.query<BookCourseMap>(
          `INSERT INTO book_course_map (book_id, course_id, semester_id, is_required, is_recommended, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           RETURNING *`,
          [bookId, mapping.course_id, mapping.semester_id, mapping.is_required, mapping.is_recommended]
        )
      );

      const mappingResults = await Promise.all(mappingInserts);
      newMappings = mappingResults.map(result => result.rows[0]);
    }

    // Commit transaction
    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      message: 'Book updated successfully',
      data: {
        book: updatedBook,
        courseMappings: newMappings
      }
    });
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');

    console.error('Error updating book:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update book',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

/**
 * DELETE - Delete book (cascades to course mappings)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookId = parseInt(params.id);

    if (isNaN(bookId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    // Check if book exists
    const existingBook = await query(
      'SELECT id, name FROM books WHERE id = $1',
      [bookId]
    );

    if (existingBook.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Book not found' },
        { status: 404 }
      );
    }

    // Delete book (course mappings cascade delete)
    await query('DELETE FROM books WHERE id = $1', [bookId]);

    return NextResponse.json({
      success: true,
      message: 'Book and associated course mappings deleted successfully',
      data: existingBook.rows[0]
    });
  } catch (error) {
    console.error('Error deleting book:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete book',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
