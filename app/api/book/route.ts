import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';

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
  academic_period_id: number;
  is_required: boolean;
  created_at?: string;
  updated_at?: string;
}

interface CreateBookRequest {
  book: Book;
  courseMappings?: BookCourseMap[];
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeMappings = searchParams.get('includeMappings') === 'true';
    const searchTerm = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const inStock = searchParams.get('inStock');

    let booksQuery = 'SELECT * FROM books';
    const queryParams: any[] = [];
    const conditions: string[] = [];

    if (searchTerm) {
      conditions.push(`(name ILIKE $${queryParams.length + 1} OR author ILIKE $${queryParams.length + 1} OR isbn ILIKE $${queryParams.length + 1})`);
      queryParams.push(`%${searchTerm}%`);
    }

    if (category) {
      conditions.push(`category = $${queryParams.length + 1}`);
      queryParams.push(category);
    }

    if (inStock === 'true' || inStock === 'false') {
      conditions.push(`in_stock = $${queryParams.length + 1}`);
      queryParams.push(inStock === 'true');
    }

    if (conditions.length > 0) {
      booksQuery += ' WHERE ' + conditions.join(' AND ');
    }

    booksQuery += ' ORDER BY created_at DESC';

    const booksResult = await query<Book>(booksQuery, queryParams);
    const books = booksResult.rows;

    if (includeMappings && books.length > 0) {
      const mappingsResult = await query<BookCourseMap>(
        `SELECT bcm.*, c.name as course_name, ap.label as period_label, ap.period_type
         FROM book_course_map bcm
         LEFT JOIN courses c ON c.id = bcm.course_id
         LEFT JOIN academic_periods ap ON ap.id = bcm.academic_period_id
         WHERE bcm.book_id = ANY($1)
         ORDER BY bcm.book_id, bcm.course_id, bcm.academic_period_id`,
        [books.map(b => b.id)]
      );

      const mappingsByBook: { [key: number]: BookCourseMap[] } = {};
      mappingsResult.rows.forEach(mapping => {
        if (!mappingsByBook[mapping.book_id]) {
          mappingsByBook[mapping.book_id] = [];
        }
        mappingsByBook[mapping.book_id].push(mapping);
      });

      const booksWithMappings = books.map(book => ({
        ...book,
        courseMappings: mappingsByBook[book.id!] || []
      }));

      return NextResponse.json({
        success: true,
        data: booksWithMappings,
        count: books.length
      });
    }

    return NextResponse.json({
      success: true,
      data: books,
      count: books.length
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch books',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const client = await getClient();

  try {
    const body: CreateBookRequest = await request.json();
    const { book, courseMappings = [] } = body;

    if (!book.name || !book.name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Book name is required' },
        { status: 400 }
      );
    }

    if (!book.author || !book.author.trim()) {
      return NextResponse.json(
        { success: false, error: 'Author is required' },
        { status: 400 }
      );
    }

    if (book.offer_price > book.actual_price) {
      return NextResponse.json(
        { success: false, error: 'Offer price cannot exceed actual price' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    const bookResult = await client.query<Book>(
      `INSERT INTO books (name, author, isbn, edition, description, image_url, actual_price, offer_price, stock_quantity, in_stock, rating, reviews_count, category, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
        book.category || null
      ]
    );

    const newBook = bookResult.rows[0];
    let newMappings: BookCourseMap[] = [];

    if (courseMappings.length > 0) {
      const periodIds = courseMappings.map(m => m.academic_period_id);
      const uniquePeriodIds = [...new Set(periodIds)];
      
      if (uniquePeriodIds.length > 0) {
        const periodCheck = await client.query(
          'SELECT id FROM academic_periods WHERE id = ANY($1)',
          [uniquePeriodIds]
        );
        
        const existingPeriodIds = new Set(periodCheck.rows.map(row => row.id));
        const missingPeriodIds = uniquePeriodIds.filter(id => !existingPeriodIds.has(id));
        
        if (missingPeriodIds.length > 0) {
          await client.query('ROLLBACK');
          return NextResponse.json(
            {
              success: false,
              error: `Referenced academic period IDs do not exist: ${missingPeriodIds.join(', ')}`
            },
            { status: 400 }
          );
        }
      }
      
      const mappingInserts = courseMappings.map(mapping =>
        client.query<BookCourseMap>(
          `INSERT INTO book_course_map (book_id, course_id, academic_period_id, is_required, created_at, updated_at)
           VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           RETURNING *`,
          [newBook.id, mapping.course_id, mapping.academic_period_id, mapping.is_required ?? true]
        )
      );

      const mappingResults = await Promise.all(mappingInserts);
      newMappings = mappingResults.map(result => result.rows[0]);
    }

    await client.query('COMMIT');

    return NextResponse.json(
      {
        success: true,
        message: 'Book created successfully',
        data: {
          book: newBook,
          courseMappings: newMappings
        }
      },
      { status: 201 }
    );
  } catch (error) {
    await client.query('ROLLBACK');

    console.error('Error creating book:', error);

    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        {
          success: false,
          error: 'A book with this ISBN already exists'
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create book',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
